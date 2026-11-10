import { prisma } from '@/lib/db'
import { createPesoSchema, pesoRegistroSchema, pesoResumoSchema } from '@/schemas/pesoSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

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

  const registros = await prisma.historicoPeso.findMany({
    where: { animalId: idAnimal },
    orderBy: { dataPesagem: 'desc' },
    select: {
      id: true,
      status: true,
      dataPesagem: true,
      peso: { select: { quantidadePeso: true } },
    },
  })

  const itens = registros.map((registro) => ({
    id: registro.id,
    quantidadePeso: registro.peso.quantidadePeso,
    status: registro.status,
    dataPesagem: registro.dataPesagem,
  }))

  const [atual, ...historico] = itens

  return NextResponse.json(pesoResumoSchema.parse({ atual: atual ?? null, historico }))
}

export async function POST(request: Request, { params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params

  try {
    const body = await request.json()
    const data = createPesoSchema.parse(body)

    const animal = await prisma.animal.findUnique({
      where: { id: idAnimal, excluidoEm: null },
      select: { id: true },
    })

    if (!animal) {
      return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    }

    const registro = await prisma.$transaction(async (tx) => {
      const peso = await tx.peso.create({
        data: {
          animalId: idAnimal,
          quantidadePeso: data.quantidadePeso,
        },
      })

      const historico = await tx.historicoPeso.create({
        data: {
          animalId: idAnimal,
          pesoId: peso.id,
          status: 'Anterior',
          dataPesagem: data.dataPesagem,
        },
        select: { id: true },
      })

      const maisRecente = await tx.historicoPeso.findFirst({
        where: { animalId: idAnimal },
        orderBy: [{ dataPesagem: 'desc' }, { id: 'desc' }],
        select: { id: true },
      })

      await tx.historicoPeso.updateMany({
        where: { animalId: idAnimal, ...(maisRecente ? { id: { not: maisRecente.id } } : {}) },
        data: { status: 'Anterior' },
      })

      if (maisRecente) {
        await tx.historicoPeso.update({
          where: { id: maisRecente.id },
          data: { status: 'Atual' },
        })
      }

      const salvo = await tx.historicoPeso.findUniqueOrThrow({
        where: { id: historico.id },
        select: {
          id: true,
          status: true,
          dataPesagem: true,
          peso: { select: { quantidadePeso: true } },
        },
      })

      return pesoRegistroSchema.parse({
        id: salvo.id,
        quantidadePeso: salvo.peso.quantidadePeso,
        status: salvo.status,
        dataPesagem: salvo.dataPesagem,
      })
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/animais/:id/peso]', error)
    return NextResponse.json({ message: 'Erro ao registrar pesagem' }, { status: 500 })
  }
}
