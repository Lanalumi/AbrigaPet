import { prisma } from '@/lib/db'
import { FormNewMedicacao } from './FormNewMedicacao'

function formatDate(value: Date) {
  const day = String(value.getDate()).padStart(2, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const year = value.getFullYear()

  return `${day}/${month}/${year}`
}

export default async function NovaMedicacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ animalId?: string | string[]; consultaId?: string | string[] }>
}) {
  const { animalId, consultaId } = await searchParams
  const selectedAnimalId = Array.isArray(animalId) ? animalId[0] : animalId
  const selectedConsultaId = Array.isArray(consultaId) ? consultaId[0] : consultaId

  const [animais, consultas, medicamentos] = await Promise.all([
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

  return (
    <div className="w-full max-w-7xl mx-auto font-poppins py-4">
      <FormNewMedicacao
        animais={animais}
        consultas={consultas.map((consulta) => ({
          id: consulta.id,
          animalId: consulta.animalId,
          label: `${formatDate(consulta.dataAtendimento)} — ${consulta.motivo.nome}`,
        }))}
        medicamentos={medicamentos.map((medicamento) => medicamento.nome)}
        animalId={selectedAnimalId}
        consultaId={selectedConsultaId}
      />
    </div>
  )
}