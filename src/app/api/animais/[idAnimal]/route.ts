import { prisma } from '@/lib/db'
import { deleteAnimalById } from '@/modules/animais/server/service'
import type { Animal as PrismaAnimal } from '@/generated/prisma/client'
import {
  animalPublicSchema,
  deriveSituacao,
  normalizeMotivoSaida,
  saidaPairError,
  updateAnimalSchema,
} from '@/schemas/animalSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

function toPublicAnimal(animal: PrismaAnimal, adotado: boolean) {
  return animalPublicSchema.parse({
    id: animal.id,
    nome: animal.nome,
    sexo: animal.sexo,
    cor: animal.cor,
    raca: animal.raca,
    pelagem: animal.pelagem,
    dataNascimento: animal.dataNascimento,
    dataChegada: animal.dataChegada,
    fivFelv: animal.fivFelv,
    foto: animal.foto,
    especie: animal.especie,
    motivoSaida: animal.motivoSaida,
    dataSaida: animal.dataSaida,
    adotado,
    situacao: deriveSituacao(animal.motivoSaida, adotado),
  })
}

export const GET = async (_request: Request, { params }: { params: Promise<{ idAnimal: string }> }) => {
  const { idAnimal } = await params

  const animal = await prisma.animal.findUnique({
    where: { id: idAnimal, excluidoEm: null },
    include: { _count: { select: { adocoes: true } } },
  })

  if (!animal) {
    return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
  }

  return NextResponse.json(toPublicAnimal(animal, animal._count.adocoes > 0), { status: 200 })
}

export const DELETE = async (_request: Request, { params }: { params: Promise<{ idAnimal: string }> }) => {
  const { idAnimal } = await params

  try {
    const deleted = await deleteAnimalById(idAnimal)
    if (!deleted) {
      return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ id: idAnimal }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/animais/:id]', error)
    return NextResponse.json({ message: 'Erro ao excluir animal' }, { status: 500 })
  }
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ idAnimal: string }> }) => {
  const { idAnimal } = await params

  try {
    const body = await request.json()
    const data = updateAnimalSchema.partial().parse(body)
    const { motivoSaida, dataSaida, foto, ...rest } = data

    if (motivoSaida !== undefined || dataSaida !== undefined) {
      if (motivoSaida === undefined || dataSaida === undefined) {
        return NextResponse.json({ message: 'Informe o motivo e a data de saída juntos' }, { status: 400 })
      }

      const pairError = saidaPairError(motivoSaida, dataSaida)
      if (pairError) {
        return NextResponse.json({ message: pairError }, { status: 400 })
      }
    }

    if (motivoSaida === 'adocao') {
      const existing = await prisma.animal.findFirst({
        where: { id: idAnimal, excluidoEm: null },
        select: { motivoSaida: true, _count: { select: { adocoes: true } } },
      })
      const wasAdocao = normalizeMotivoSaida(existing?.motivoSaida) === 'adocao'
      if (existing && !wasAdocao && existing._count.adocoes === 0) {
        return NextResponse.json(
          { message: 'Para registrar uma adoção, vincule o animal pela página do adotante' },
          { status: 400 },
        )
      }
    }

    const animal = await prisma.$transaction(async (tx) => {
      const updated = await tx.animal.update({
        data: {
          ...rest,
          ...(motivoSaida !== undefined && {
            motivoSaida,
          }),
          ...(dataSaida !== undefined && {
            dataSaida,
          }),
          ...(foto !== undefined && {
            foto: foto || null,
          }),
        },
        where: { id: idAnimal, excluidoEm: null },
      })

      if (motivoSaida !== undefined && motivoSaida !== 'adocao') {
        await tx.adocao.deleteMany({ where: { animalId: idAnimal } })
      } else if (motivoSaida === 'adocao' && dataSaida) {
        await tx.adocao.updateMany({ where: { animalId: idAnimal }, data: { dataAdocao: dataSaida } })
      }

      return tx.animal.findUniqueOrThrow({
        where: { id: updated.id },
        include: { _count: { select: { adocoes: true } } },
      })
    })

    return NextResponse.json(toPublicAnimal(animal, animal._count.adocoes > 0), { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    }

    console.error('[PATCH /api/animais/:id]', error)
    return NextResponse.json({ message: 'Erro ao atualizar animal' }, { status: 500 })
  }
}
