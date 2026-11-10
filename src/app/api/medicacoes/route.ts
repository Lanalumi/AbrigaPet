import { prisma } from '@/lib/db'
import { findOrCreateMedicamento } from '@/modules/saude/server/lookup'
import { createMedicacaoSchema } from '@/schemas/saudeSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createMedicacaoSchema.parse(body)

    const consulta = await prisma.consulta.findUnique({
      where: { id: data.consultaId },
      select: { id: true, animalId: true, animal: { select: { excluidoEm: true } } },
    })

    if (!consulta || consulta.animalId !== data.animalId || consulta.animal.excluidoEm) {
      return NextResponse.json({ message: 'A ficha médica não pertence a este animal' }, { status: 400 })
    }

    const medicamento = await findOrCreateMedicamento(data.medicamento)

    const prescricao = await prisma.prescreve.create({
      data: {
        consultaId: consulta.id,
        medicamentoId: medicamento.id,
        tipo: data.tipo?.trim() || null,
        dosagem: data.dosagem.trim(),
        quantidade: data.quantidade,
        frequencia: data.frequencia.trim(),
        duracaoTratamento: data.duracaoTratamento.trim(),
      },
      select: { id: true, consultaId: true },
    })

    return NextResponse.json({ ...prescricao, animalId: consulta.animalId }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/medicacoes]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar medicação' }, { status: 500 })
  }
}
