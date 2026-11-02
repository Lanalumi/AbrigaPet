import { prisma } from '@/lib/db'
import { formatBrDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { notFound } from 'next/navigation'
import { FormNewMedicacao } from '../new/FormNewMedicacao'

export default async function MedicacaoPage({ params }: { params: Promise<{ idPrescricao: string }> }) {
  const { idPrescricao } = await params

  const [prescricao, animais, consultas, medicamentos] = await Promise.all([
    prisma.prescreve.findFirst({
      where: { id: idPrescricao, consulta: { animal: { excluidoEm: null } } },
      select: {
        id: true,
        consultaId: true,
        tipo: true,
        dosagem: true,
        quantidade: true,
        frequencia: true,
        duracaoTratamento: true,
        medicamento: { select: { nome: true } },
        consulta: { select: { animalId: true } },
      },
    }),
    prisma.animal.findMany({ where: { excluidoEm: null }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
    prisma.consulta.findMany({
      where: { animal: { excluidoEm: null } },
      orderBy: { dataAtendimento: 'desc' },
      select: {
        id: true,
        animalId: true,
        dataAtendimento: true,
        motivo: { select: { nome: true } },
      },
    }),
    prisma.medicamento.findMany({ select: { nome: true }, orderBy: { nome: 'asc' } }),
  ])

  if (!prescricao) notFound()

  return (
    <div className="w-full max-w-7xl mx-auto font-poppins py-4">
      <FormNewMedicacao
        animais={animais}
        consultas={consultas.map((consulta) => ({
          id: consulta.id,
          animalId: consulta.animalId,
          label: `${formatBrDate(consulta.dataAtendimento)} — ${consulta.motivo.nome}`,
        }))}
        medicamentos={medicamentos.map((medicamento) => medicamento.nome)}
        existing={{
          id: prescricao.id,
          values: {
            animalId: prescricao.consulta.animalId,
            consultaId: prescricao.consultaId,
            medicamento: prescricao.medicamento.nome,
            tipo: prescricao.tipo ?? '',
            dosagem: prescricao.dosagem,
            quantidade: String(prescricao.quantidade),
            frequencia: prescricao.frequencia,
            duracaoTratamento: prescricao.duracaoTratamento,
          },
        }}
      />
    </div>
  )
}
