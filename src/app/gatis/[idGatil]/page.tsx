import { FormEditGatil } from '@/modules/gatis/components/FormEditGatil/FormEditGatil'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatDate(value: Date) {
  const day = String(value.getUTCDate()).padStart(2, '0')
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const year = value.getUTCFullYear()

  return `${day}/${month}/${year}`
}

export default async function GatilPage({ params }: { params: Promise<{ idGatil: string }> }) {
  const { idGatil } = await params
  const local = await prisma.localizacao.findUnique({
    where: { id: idGatil },
    select: {
      id: true,
      nome: true,
      tipoLocal: true,
      ativo: true,
      historicos: {
        orderBy: { dataEntrada: 'desc' },
        select: {
          id: true,
          status: true,
          dataEntrada: true,
          dataSaida: true,
          animal: { select: { id: true, nome: true, excluidoEm: true } },
        },
      },
    },
  })

  if (!local) notFound()

  const presentes = local.historicos.filter((historico) => !historico.dataSaida)
  const anteriores = local.historicos.filter((historico) => historico.dataSaida)
  const totalAnimais = new Set(presentes.map((historico) => historico.animal.id)).size || 0

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-poppins pb-8">
      
      {/* Cabeçalho da Página */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#755835]/15">
        <div>
          <span className="text-xs font-semibold text-[#755835]/70 tracking-wide uppercase">Gatil</span>
          <h1 className="text-2xl font-bold text-[#3A250B] tracking-tight mt-0.5">{local.nome}</h1>
          <p className="text-xs font-semibold text-[#755835]/80 mt-1">
            {totalAnimais} {totalAnimais === 1 ? 'animal no local' : 'animais no local'}
          </p>
        </div>
        <Link
          href="/gatis"
          className="px-4 py-2 rounded-xl bg-[#FDF8F3] hover:bg-[#755835]/10 border border-[#755835]/20 text-xs font-bold text-[#3A250B] transition-all text-center"
        >
          ← Voltar para os gatis
        </Link>
      </header>

      {/* Formulário de Edição */}
      <div className="w-full">
        <FormEditGatil
          initialState={{ id: local.id, nome: local.nome, tipoLocal: local.tipoLocal, ativo: local.ativo }}
        />
      </div>

      {/* Seção: Animais neste local */}
      <section className="rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)] flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#3A250B] pb-2 border-b border-[#755835]/15">
          Animais neste local
        </h2>
        {presentes.length === 0 ? (
          <p className="text-xs font-medium text-[#755835]/70 italic py-2">
            Nenhum animal está aqui agora.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {presentes.map((historico) => (
              <li key={historico.id} className="text-xs font-semibold text-[#3A250B] flex items-center justify-between p-3 rounded-2xl bg-[#FDF8F3] border border-[#755835]/10">
                <Link href={`/animais/${historico.animal.id}`} className="hover:text-[#5C7C3A] transition-colors font-bold">
                  {historico.animal.nome}
                </Link>
                <span className="text-[#755835]/70 font-medium">
                  {historico.status} · desde {formatDate(historico.dataEntrada)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Seção: Passaram por aqui */}
      {anteriores.length > 0 && (
        <section className="rounded-3xl border border-[#755835]/20 bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(58,37,11,0.05)] flex flex-col gap-4">
          <h2 className="text-base font-bold text-[#3A250B] pb-2 border-b border-[#755835]/15">
            Passaram por aqui
          </h2>
          <ul className="flex flex-col gap-2.5">
            {anteriores.map((historico) => (
              <li key={historico.id} className="text-xs font-semibold text-[#3A250B] flex items-center justify-between p-3 rounded-2xl bg-[#FDF8F3] border border-[#755835]/10">
                {historico.animal.excluidoEm ? (
                  <span className="font-bold text-[#755835]/70">{`${historico.animal.nome} (excluído)`}</span>
                ) : (
                  <Link href={`/animais/${historico.animal.id}`} className="hover:text-[#5C7C3A] transition-colors font-bold">
                    {historico.animal.nome}
                  </Link>
                )}
                <span className="text-[#755835]/70 font-medium">
                  {formatDate(historico.dataEntrada)} até {historico.dataSaida ? formatDate(historico.dataSaida) : '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  )
}