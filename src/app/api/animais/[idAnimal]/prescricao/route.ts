import { prisma } from '@/lib/db'
import { formatStartDate, isVacina, periodOfDay, prescriptionNextDose } from '@/modules/animais/prescricao/schedule'
import { latestPrescriptionSchema } from '@/schemas/saudeSchema'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params

  const animal = await prisma.animal.findUnique({
    where: { id: idAnimal, excluidoEm: null },
    select: { id: true },
  })

  if (!animal) {
    return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
  }

  const consulta = await prisma.consulta.findFirst({
    where: { animalId: idAnimal, prescricoes: { some: {} } },
    orderBy: { dataAtendimento: 'desc' },
    select: {
      dataAtendimento: true,
      prescricoes: {
        orderBy: { medicamento: { nome: 'asc' } },
        select: {
          id: true,
          dosagem: true,
          frequencia: true,
          duracaoTratamento: true,
          dataAplicacao: true,
          dataProximaDose: true,
          medicamento: { select: { nome: true } },
        },
      },
    },
  })

  const medicamentos =
    consulta?.prescricoes.map((prescricao) => ({
      id: prescricao.id,
      nome: prescricao.medicamento.nome,
      dataInicio: formatStartDate(
        isVacina(prescricao.frequencia) && prescricao.dataAplicacao ? prescricao.dataAplicacao : consulta.dataAtendimento,
      ),
      proximaDose: prescriptionNextDose(
        consulta.dataAtendimento,
        prescricao.frequencia,
        prescricao.duracaoTratamento,
        prescricao.dataProximaDose,
      ),
      dosagem: prescricao.dosagem,
      periodo: periodOfDay(prescricao.frequencia),
    })) ?? []

  return NextResponse.json(latestPrescriptionSchema.parse({ medicamentos }))
}
