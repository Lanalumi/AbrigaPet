import { prisma } from '@/lib/db'
import {
  createHistoricoLocalSchema,
  historicoLocalRegistroSchema,
  historicoLocalResumoSchema,
} from '@/schemas/localizacaoSchema'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const runtime = 'nodejs'

function toRegistro(registro: {
  id: string
  localizacaoId: string
  status: string
  dataEntrada: Date
  dataSaida: Date | null
  localizacao: { nome: string; tipoLocal: string }
}) {
  return {
    id: registro.id,
    localizacaoId: registro.localizacaoId,
    nome: registro.localizacao.nome,
    tipoLocal: registro.localizacao.tipoLocal,
    status: registro.status,
    dataEntrada: registro.dataEntrada,
    dataSaida: registro.dataSaida,
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params

  const animal = await prisma.animal.findUnique({
    where: { id: idAnimal, excluidoEm: null },
    select: { id: true },
  })

  if (!animal) {
    return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
  }

  const [registros, locais] = await Promise.all([
    prisma.historicoLocalizacao.findMany({
      where: { animalId: idAnimal },
      orderBy: [{ dataEntrada: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        localizacaoId: true,
        status: true,
        dataEntrada: true,
        dataSaida: true,
        localizacao: { select: { nome: true, tipoLocal: true } },
      },
    }),
    prisma.localizacao.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, tipoLocal: true },
    }),
  ])

  const itens = registros.map(toRegistro)
  const atual = itens.find((registro) => registro.dataSaida == null) ?? null
  const historico = itens.filter((registro) => registro.id !== atual?.id)

  return NextResponse.json(historicoLocalResumoSchema.parse({ atual, historico, locais }))
}

export async function POST(request: Request, { params }: { params: Promise<{ idAnimal: string }> }) {
  const { idAnimal } = await params

  try {
    const body = await request.json()
    const data = createHistoricoLocalSchema.parse(body)

    const animal = await prisma.animal.findUnique({
      where: { id: idAnimal, excluidoEm: null },
      select: { id: true },
    })

    if (!animal) {
      return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    }

    const local = await prisma.localizacao.findUnique({
      where: { id: data.localizacaoId },
      select: { id: true, ativo: true },
    })

    if (!local) {
      return NextResponse.json({ message: 'Local não encontrado' }, { status: 404 })
    }

    if (!local.ativo) {
      return NextResponse.json({ message: 'Este local está inativo' }, { status: 400 })
    }

    const registro = await prisma.$transaction(async (tx) => {
      await tx.historicoLocalizacao.updateMany({
        where: { animalId: idAnimal, dataSaida: null },
        data: { dataSaida: data.dataEntrada, status: 'Anterior' },
      })

      const created = await tx.historicoLocalizacao.create({
        data: {
          animalId: idAnimal,
          localizacaoId: local.id,
          status: 'Atual',
          dataEntrada: data.dataEntrada,
        },
        select: {
          id: true,
          localizacaoId: true,
          status: true,
          dataEntrada: true,
          dataSaida: true,
          localizacao: { select: { nome: true, tipoLocal: true } },
        },
      })

      return historicoLocalRegistroSchema.parse(toRegistro(created))
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: 'Dados inválidos', error: error.flatten().fieldErrors }, { status: 400 })
    }

    console.error('[POST /api/animais/:id/local]', error)
    return NextResponse.json({ message: 'Erro ao registrar local' }, { status: 500 })
  }
}
