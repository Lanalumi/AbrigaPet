import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { listAnimalsQuerySchema, motivoFromSearch } from '@/schemas/animalSchema'

export const animalById = (id: string) => {
  const where: Prisma.AnimalWhereUniqueInput = { id, excluidoEm: null }
  return prisma.animal.findUnique({
    where,
    include: { _count: { select: { adocoes: true } } },
  })
}

export const animalCreate = (data: Prisma.AnimalCreateInput) => prisma.animal.create({ data })

function tryParseSearchDate(value: string): Date | null {
  const trimmed = value.trim()
  const brMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (brMatch) {
    const day = Number(brMatch[1])
    const month = Number(brMatch[2])
    const year = Number(brMatch[3])
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date
    }
    return null
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dayRange(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function animalFindMany(raw: unknown) {
  const { page, pageSize, search, sortBy, sortDir } = listAnimalsQuerySchema.parse(raw)

  const searchConditions: Prisma.AnimalWhereInput[] = []

  if (search) {
    searchConditions.push(
      { nome: { contains: search, mode: 'insensitive' } },
      { raca: { contains: search, mode: 'insensitive' } },
      { especie: { contains: search, mode: 'insensitive' } },
      { motivoSaida: { contains: search, mode: 'insensitive' } },
    )

    const motivo = motivoFromSearch(search)
    if (motivo) {
      searchConditions.push({ motivoSaida: { equals: motivo, mode: 'insensitive' } })
    }

    const normalizedSearch = search.trim().toLowerCase()
    if (normalizedSearch === 'macho') {
      searchConditions.push({ sexo: true })
    } else if (normalizedSearch === 'femea' || normalizedSearch === 'fêmea') {
      searchConditions.push({ sexo: false })
    }

    const parsedDate = tryParseSearchDate(search)
    if (parsedDate) {
      const { start, end } = dayRange(parsedDate)
      searchConditions.push(
        { dataNascimento: { gte: start, lte: end } },
        { dataChegada: { gte: start, lte: end } },
        { dataSaida: { gte: start, lte: end } },
      )
    }
  }

  const where: Prisma.AnimalWhereInput = {
    excluidoEm: null,
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
      include: {
        _count: { select: { adocoes: true } },
        historicosLocalizacao: {
          where: { dataSaida: null },
          orderBy: { dataEntrada: 'desc' },
          take: 1,
          include: {
            localizacao: {
              select: { nome: true, tipoLocal: true },
            },
          },
        },
      },
    }),
    prisma.animal.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export const animalUpdate = (id: string, data: Prisma.AnimalUpdateInput) =>
  prisma.animal.update({
    where: { id },
    data,
    include: { _count: { select: { adocoes: true } } },
  })

export const animalSoftDelete = (id: string) => {
  const now = new Date()
  return prisma.$transaction([
    prisma.historicoLocalizacao.updateMany({
      where: { animalId: id, dataSaida: null },
      data: { dataSaida: now },
    }),
    prisma.animal.update({ where: { id }, data: { excluidoEm: now } }),
  ])
}
