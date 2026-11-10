import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { listLocalizacoesQuerySchema } from '@/schemas/localizacaoSchema'

export async function localizacaoFindMany(raw: unknown) {
  const { page, pageSize, search, sortBy, sortDir } = listLocalizacoesQuerySchema.parse(raw)

  const searchConditions: Prisma.LocalizacaoWhereInput[] = []

  if (search) {
    searchConditions.push(
      { nome: { contains: search, mode: 'insensitive' } },
      { tipoLocal: { contains: search, mode: 'insensitive' } },
    )
  }

  const where: Prisma.LocalizacaoWhereInput = {
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.localizacao.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
      include: {
        historicos: {
          where: { dataSaida: null },
          select: { animalId: true },
        },
      },
    }),
    prisma.localizacao.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export const localizacaoCreate = (data: Prisma.LocalizacaoCreateInput) => prisma.localizacao.create({ data })

export const localizacaoUpdate = (id: string, data: Prisma.LocalizacaoUpdateInput) =>
  prisma.localizacao.update({ where: { id }, data })

export const localizacaoFindWithHistory = (id: string) =>
  prisma.localizacao.findUnique({
    where: { id },
    select: {
      id: true,
      _count: { select: { historicos: true } },
      historicos: { where: { dataSaida: null }, select: { id: true }, take: 1 },
    },
  })

export const localizacaoDelete = (id: string) => prisma.localizacao.delete({ where: { id } })
