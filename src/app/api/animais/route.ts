import { prisma } from '@/lib/db'
import { listAnimals } from '@/modules/animais/server/service'
import { createAnimalSchema } from '@/schemas/cadastroSchemas'
import { animalPublicSchema, deriveSituacao, saidaPairError } from '@/schemas/animalSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createAnimalSchema.parse(body)

    const pairError = saidaPairError(data.motivoSaida, data.dataSaida)
    if (pairError) {
      return NextResponse.json({ message: pairError }, { status: 400 })
    }

    const animal = await prisma.animal.create({
      data: {
        nome: data.nome,
        sexo: data.sexo,
        cor: data.cor,
        raca: data.raca,
        pelagem: data.pelagem,
        dataNascimento: data.dataNascimento,
        dataChegada: data.dataChegada,
        dataSaida: data.dataSaida,
        fivFelv: data.fivFelv,
        foto: data.foto || null,
        especie: data.especie,
        motivoSaida: data.motivoSaida,
      },
    })

    const response = animalPublicSchema.parse({
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
      adotado: false,
      situacao: deriveSituacao(animal.motivoSaida, false),
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/animais]', error)
    return NextResponse.json({ message: 'Erro ao cadastrar animal' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())

  const data = await listAnimals(queryParams)

  return NextResponse.json(data)
}
