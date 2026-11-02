import { FormNewFicha } from '@/app/saude/fichas/new/FormNewFicha'
import { prisma } from '@/lib/db'
import { formatBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { notFound } from 'next/navigation'

export default async function ConsultaPage({ params }: { params: Promise<{ idConsulta: string }> }) {
  const { idConsulta } = await params

  const [consulta, animais, clinicas, motivos] = await Promise.all([
    prisma.consulta.findFirst({
      where: { id: idConsulta, animal: { excluidoEm: null } },
      select: {
        id: true,
        animalId: true,
        clinicaId: true,
        observacao: true,
        dataAtendimento: true,
        dataRetorno: true,
        motivo: { select: { nome: true } },
        _count: { select: { prescricoes: true } },
      },
    }),
    prisma.animal.findMany({ where: { excluidoEm: null }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.clinica.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.motivo.findMany({ select: { nome: true }, orderBy: { nome: 'asc' } }),
  ])

  if (!consulta) notFound()

  return (
    <div className="flex w-full max-w-4xl mx-auto flex-col p-6 sm:p-8">
      <header className="flex flex-col items-center justify-center text-center gap-2 pb-6 mb-6 border-b border-[#755835]/15">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#755835]/10 text-[#755835] shrink-0">
            <img src="/images/icons/paw2.svg" alt="Patinha" width={22} height={22} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#3A250B] font-poppins tracking-tight">Consulta</h1>
        </div>
        <p className="text-xs text-[#755835]/80 font-poppins">Registro de atendimento clínico e histórico de saúde</p>
      </header>

      <FormNewFicha
        animais={animais}
        clinicas={clinicas}
        motivos={motivos.map((motivo) => motivo.nome)}
        existing={{
          id: consulta.id,
          totalPrescricoes: consulta._count.prescricoes,
          values: {
            animalId: consulta.animalId,
            clinicaId: consulta.clinicaId,
            motivo: consulta.motivo.nome,
            observacao: consulta.observacao,
            dataAtendimento: formatBrDate(consulta.dataAtendimento),
            dataRetorno: formatBrDate(consulta.dataRetorno),
          },
        }}
      />
    </div>
  )
}
