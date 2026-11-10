import { prisma } from '@/lib/db'
import { findOrCreateMotivo } from '@/modules/saude/server/lookup'
import { createFichaMedicaSchema } from '@/schemas/saudeSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createFichaMedicaSchema.parse(body)

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

    const consulta = await prisma.consulta.create({
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

    return NextResponse.json(consulta, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/fichas]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar ficha médica' }, { status: 500 })
  }
}
