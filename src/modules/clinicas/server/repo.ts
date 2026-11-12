import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { listClinicasQuerySchema } from '@/schemas/clinicaSchema'

export async function clinicaFindMany(raw: unknown) {
  const { page, pageSize, search, sortBy, sortDir } = listClinicasQuerySchema.parse(raw)

  const searchConditions: Prisma.ClinicaWhereInput[] = []

  if (search) {
    searchConditions.push(
      { nome: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
      { telefone: { contains: search, mode: 'insensitive' } },
      { cidade: { contains: search, mode: 'insensitive' } },
    )
  }

  const where: Prisma.ClinicaWhereInput = {
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.clinica.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
    }),
    prisma.clinica.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export const clinicaFindById = (id: string) => prisma.clinica.findUnique({ where: { id } })

export const clinicaDelete = (id: string) => prisma.clinica.delete({ where: { id } })

export const clinicaCreate = (data: Prisma.ClinicaCreateInput) => prisma.clinica.create({ data })

export const clinicaUpdate = (id: string, data: Prisma.ClinicaUpdateInput) =>
  prisma.clinica.update({ where: { id }, data })
