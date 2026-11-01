import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClinicaInfoButton } from './ClinicaInfoButton'

function formatDate(value: Date) {
  const day = String(value.getUTCDate()).padStart(2, '0')
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const year = value.getUTCFullYear()

  return `${day}/${month}/${year}`
}

const prescriptionColumns = ['Nome', 'Tipo', 'Dosagem', 'Quantidade', 'Duração', 'Frequência'] as const
const historyColumns = ['Data', 'Clínica', 'Motivo', 'Observação'] as const

export default async function FichaMedicaAnimalPage({
  params,
  searchParams,
}: {
  params: Promise<{ idAnimal: string }>
  searchParams: Promise<{ consulta?: string | string[] }>
}) {
  const { idAnimal } = await params
  const { consulta: consultaParam } = await searchParams
  const requestedConsultaId = Array.isArray(consultaParam) ? consultaParam[0] : consultaParam
  const animal = await prisma.animal.findUnique({
    where: { id: idAnimal },
    select: {
      id: true,
      nome: true,
      foto: true,
      consultas: {
        orderBy: { dataAtendimento: 'desc' },
        select: {
          id: true,
          observacao: true,
          dataAtendimento: true,
          dataRetorno: true,
          motivo: { select: { nome: true } },
          clinica: {
            select: {
              nome: true,
              cnpj: true,
              telefone: true,
              rua: true,
              numero: true,
              bairro: true,
              cidade: true,
            },
          },
          prescricoes: {
            orderBy: { medicamento: { nome: 'asc' } },
            select: {
              id: true,
              tipo: true,
              dosagem: true,
              quantidade: true,
              frequencia: true,
              duracaoTratamento: true,
              medicamento: { select: { nome: true } },
            },
          },
        },
      },
    },
  })

  if (!animal) notFound()

  const foto = animal.foto?.trim()
  const consulta =
    animal.consultas.find((item) => item.id === requestedConsultaId) ?? animal.consultas[0] ?? null

  return (
    <div className="flex w-full max-w-6xl mx-auto flex-col gap-8 p-6 sm:p-8">
      {/* Cabeçalho */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#755835]/15">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#755835]/20 bg-white shadow-sm">
            {foto ? (
              <img src={foto} alt={`Foto de ${animal.nome}`} className="h-full w-full object-cover" />
            ) : (
              <img src="/images/icons/paw.svg" alt="" className="h-10 w-10 opacity-40" aria-hidden />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-poppins text-xs font-bold uppercase tracking-wider text-[#755835]/70 mb-1">
              Ficha médica
            </span>
            <h1 className="font-poppins text-3xl font-extrabold text-[#3A250B]">{animal.nome}</h1>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/animais/${animal.id}`}
            className="rounded-xl border border-[#755835]/20 bg-white px-4 py-2 font-poppins text-xs font-semibold text-[#755835] hover:bg-[#FDF8F3] transition-colors shadow-sm"
          >
            ← Voltar para o animal
          </Link>
          <Link
            href={`/saude/consultas/new?animalId=${animal.id}`}
            className="rounded-xl bg-[#8AA36C] px-4 py-2 font-poppins text-xs font-semibold text-white hover:bg-[#7a935c] transition-colors shadow-sm"
          >
            + Nova consulta
          </Link>
          {consulta ? (
            <Link
              href={`/saude/medicacoes/new?animalId=${animal.id}&consultaId=${consulta.id}`}
              className="rounded-xl border border-[#8AA36C] bg-white px-4 py-2 font-poppins text-xs font-semibold text-[#8AA36C] hover:bg-[#f3f7ef] transition-colors shadow-sm"
            >
              + Nova medicação
            </Link>
          ) : null}
        </div>
      </header>

      {/* Conteúdo Principal */}
      {consulta ? (
        <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
          {/* Coluna Esquerda: Prescrição */}
          <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#755835]/20 bg-white shadow-[0_4px_20px_rgba(58,37,11,0.03)]">
            <div className="border-b border-[#755835]/10 bg-[#FDF8F3] p-5">
              <h2 className="font-poppins text-[15px] font-bold text-[#3A250B]">Prescrição</h2>
              <p className="font-poppins text-xs font-medium text-[#755835]/70 mt-0.5">
                Medicamentos desta consulta, aferida em {formatDate(consulta.dataAtendimento)}.
              </p>
            </div>
            
            <div className="p-0">
              {consulta.prescricoes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-poppins text-sm font-medium text-[#755835]/60">
                    Nenhuma prescrição registrada nesta consulta.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left font-poppins text-sm" aria-label="Prescrição">
                    <thead>
                      <tr className="border-b border-[#755835]/10 bg-white text-xs font-semibold text-[#755835]/60 uppercase tracking-wider">
                        {prescriptionColumns.map((column) => (
                          <th key={column} className="px-5 py-4 whitespace-nowrap">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#755835]/5">
                      {consulta.prescricoes.map((prescricao) => (
                        <tr key={prescricao.id} className="hover:bg-[#FDF8F3]/50 transition-colors">
                          <td className="px-5 py-4 font-bold text-[#3A250B] whitespace-nowrap">{prescricao.medicamento.nome}</td>
                          <td className="px-5 py-4 font-medium text-[#755835]">{prescricao.tipo?.trim() || '—'}</td>
                          <td className="px-5 py-4 font-medium text-[#755835]">{prescricao.dosagem}</td>
                          <td className="px-5 py-4 font-medium text-[#755835]">{prescricao.quantidade}</td>
                          <td className="px-5 py-4 font-medium text-[#755835]">{prescricao.duracaoTratamento}</td>
                          <td className="px-5 py-4 font-medium text-[#755835]">{prescricao.frequencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </article>

          {/* Coluna Direita: Dados da Consulta */}
          <article className="flex w-full flex-col rounded-2xl border border-[#755835]/20 bg-[#FDF8F3] shadow-[0_4px_20px_rgba(58,37,11,0.03)] p-6">
            <h2 className="font-poppins text-[15px] font-bold text-[#3A250B] mb-5 pb-3 border-b border-[#755835]/10">
              Detalhes do atendimento
            </h2>
            <dl className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <dt className="font-poppins text-[11px] font-bold uppercase tracking-wider text-[#755835]/60">Data de atendimento</dt>
                <dd className="font-poppins text-sm font-semibold text-[#3A250B]">
                  {formatDate(consulta.dataAtendimento)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-poppins text-[11px] font-bold uppercase tracking-wider text-[#755835]/60">Data de retorno</dt>
                <dd className="font-poppins text-sm font-semibold text-[#3A250B]">
                  {consulta.dataRetorno ? formatDate(consulta.dataRetorno) : '—'}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-poppins text-[11px] font-bold uppercase tracking-wider text-[#755835]/60">Motivo</dt>
                <dd className="font-poppins text-sm font-semibold text-[#3A250B]">{consulta.motivo.nome}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-poppins text-[11px] font-bold uppercase tracking-wider text-[#755835]/60">Clínica</dt>
                <dd className="font-poppins text-sm">
                  <ClinicaInfoButton clinica={consulta.clinica} />
                </dd>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <dt className="font-poppins text-[11px] font-bold uppercase tracking-wider text-[#755835]/60">Observação</dt>
                <dd className="whitespace-pre-wrap font-poppins text-sm font-medium text-[#755835] rounded-xl bg-white p-3 border border-[#755835]/10 mt-1">
                  {consulta.observacao.trim() || 'Nenhuma observação registrada.'}
                </dd>
              </div>
            </dl>
          </article>
        </section>
      ) : (
        <div className="flex items-center justify-center p-12 border-2 border-dashed border-[#755835]/20 rounded-2xl bg-[#FDF8F3]/50">
          <p className="font-poppins text-sm font-medium text-[#755835]/70 text-center max-w-md">
            Nenhuma consulta registrada nesta ficha. Quando adicionar a primeira consulta, ela aparecerá aqui como o histórico clínico inicial.
          </p>
        </div>
      )}

      {/* Tabela de Histórico */}
      <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#755835]/20 bg-white shadow-[0_4px_20px_rgba(58,37,11,0.03)] mt-2">
        <div className="border-b border-[#755835]/10 bg-white p-5">
          <h2 className="font-poppins text-[15px] font-bold text-[#3A250B]">Histórico de consultas</h2>
          <p className="font-poppins text-xs font-medium text-[#755835]/70 mt-0.5">
            Selecione uma data para visualizar os detalhes e prescrições daquele atendimento.
          </p>
        </div>
        
        {animal.consultas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-poppins text-sm font-medium text-[#755835]/60">Nenhuma consulta registrada no histórico.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-poppins text-sm" aria-label="Histórico de consultas">
              <thead>
                <tr className="border-b border-[#755835]/10 bg-[#FDF8F3] text-xs font-semibold text-[#755835]/60 uppercase tracking-wider">
                  {historyColumns.map((column) => (
                    <th key={column} className="px-5 py-4">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#755835]/5">
                {animal.consultas.map((item) => {
                  const selected = item.id === consulta?.id
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${selected ? 'bg-[#8AA36C]/5' : 'hover:bg-[#FDF8F3]/50'}`}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          href={`/animais/${animal.id}/fichamedica?consulta=${item.id}`}
                          className={`font-bold transition-colors hover:underline ${selected ? 'text-[#5C7C3A]' : 'text-[#755835]'}`}
                        >
                          {formatDate(item.dataAtendimento)}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-[#3A250B]">{item.clinica.nome}</td>
                      <td className="px-5 py-4 font-medium text-[#755835]">{item.motivo.nome}</td>
                      <td className="px-5 py-4 font-medium text-[#755835] truncate max-w-xs">
                        {item.observacao.trim() || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}