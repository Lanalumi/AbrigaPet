import { prisma } from '@/lib/db'
import { findOrCreateMedicamento } from '@/modules/saude/server/lookup'
import { prescricaoScheduleData } from '@/modules/saude/server/prescricao'
import { createMedicacaoSchema } from '@/schemas/saudeSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

const findPrescricao = (id: string) =>
  prisma.prescreve.findFirst({
    where: { id, consulta: { animal: { excluidoEm: null } } },
    select: { id: true, consultaId: true, consulta: { select: { animalId: true } } },
  })

export async function PATCH(request: Request, { params }: { params: Promise<{ idPrescricao: string }> }) {
  const { idPrescricao } = await params

  try {
    const body = await request.json()
    const data = createMedicacaoSchema.parse(body)

    const prescricao = await findPrescricao(idPrescricao)
    if (!prescricao) {
      return NextResponse.json({ message: 'Medicação não encontrada' }, { status: 404 })
    }

    const consulta = await prisma.consulta.findUnique({
      where: { id: data.consultaId },
      select: { id: true, animalId: true, animal: { select: { excluidoEm: true } } },
    })

    if (!consulta || consulta.animalId !== data.animalId || consulta.animal.excluidoEm) {
      return NextResponse.json({ message: 'A ficha médica não pertence a este animal' }, { status: 400 })
    }

    const medicamento = await findOrCreateMedicamento(data.medicamento)

    const updated = await prisma.prescreve.update({
      where: { id: prescricao.id },
      data: {
        consultaId: consulta.id,
        medicamentoId: medicamento.id,
        tipo: data.tipo?.trim() || null,
        dosagem: data.dosagem.trim(),
        quantidade: data.quantidade,
        ...prescricaoScheduleData(data),
      },
      select: { id: true, consultaId: true },
    })

    return NextResponse.json({ ...updated, animalId: consulta.animalId })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[PATCH /api/medicacoes/:id]', error)
    return NextResponse.json({ message: 'Erro ao atualizar medicação' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ idPrescricao: string }> }) {
  const { idPrescricao } = await params

  try {
    const prescricao = await findPrescricao(idPrescricao)
    if (!prescricao) {
      return NextResponse.json({ message: 'Medicação não encontrada' }, { status: 404 })
    }

    await prisma.prescreve.delete({ where: { id: prescricao.id } })

    return NextResponse.json({
      id: prescricao.id,
      consultaId: prescricao.consultaId,
      animalId: prescricao.consulta.animalId,
    })
  } catch (error) {
    console.error('[DELETE /api/medicacoes/:id]', error)
    return NextResponse.json({ message: 'Erro ao excluir medicação' }, { status: 500 })
  }
}
