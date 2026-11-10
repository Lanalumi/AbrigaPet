import { prisma } from '@/lib/db'
import { findOrCreateMotivo } from '@/modules/saude/server/lookup'
import { createFichaMedicaSchema } from '@/schemas/saudeSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

const findConsulta = (id: string) =>
  prisma.consulta.findFirst({
    where: { id, animal: { excluidoEm: null } },
    select: { id: true, animalId: true },
  })

export async function PATCH(request: Request, { params }: { params: Promise<{ idConsulta: string }> }) {
  const { idConsulta } = await params

  try {
    const body = await request.json()
    const data = createFichaMedicaSchema.parse(body)

    const consulta = await findConsulta(idConsulta)
    if (!consulta) {
      return NextResponse.json({ message: 'Consulta não encontrada' }, { status: 404 })
    }

    const [animal, clinica] = await Promise.all([
      prisma.animal.findUnique({ where: { id: data.animalId, excluidoEm: null }, select: { id: true } }),
      prisma.clinica.findUnique({ where: { id: data.clinicaId }, select: { id: true } }),
    ])

    if (!animal) {
      return NextResponse.json({ message: 'Animal não encontrado' }, { status: 400 })
    }

    if (!clinica) {
      return NextResponse.json({ message: 'Clínica não encontrada' }, { status: 400 })
    }

    const motivo = await findOrCreateMotivo(data.motivo)

    const updated = await prisma.consulta.update({
      where: { id: consulta.id },
      data: {
        animalId: data.animalId,
        clinicaId: data.clinicaId,
        motivoId: motivo.id,
        observacao: data.observacao.trim(),
        dataAtendimento: data.dataAtendimento,
        dataRetorno: data.dataRetorno,
      },
      select: { id: true, animalId: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[PATCH /api/fichas/:id]', error)
    return NextResponse.json({ message: 'Erro ao atualizar consulta' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ idConsulta: string }> }) {
  const { idConsulta } = await params

  try {
    const consulta = await findConsulta(idConsulta)
    if (!consulta) {
      return NextResponse.json({ message: 'Consulta não encontrada' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.prescreve.deleteMany({ where: { consultaId: consulta.id } }),
      prisma.consulta.delete({ where: { id: consulta.id } }),
    ])

    return NextResponse.json(consulta)
  } catch (error) {
    console.error('[DELETE /api/fichas/:id]', error)
    return NextResponse.json({ message: 'Erro ao excluir consulta' }, { status: 500 })
  }
}
