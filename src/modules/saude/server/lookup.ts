import { prisma } from '@/lib/db'

export async function findOrCreateMotivo(nome: string) {
  const motivoNome = nome.trim()
  const existente = await prisma.motivo.findFirst({
    where: { nome: { equals: motivoNome, mode: 'insensitive' } },
    select: { id: true },
  })
  return existente ?? prisma.motivo.create({ data: { nome: motivoNome }, select: { id: true } })
}

export async function findOrCreateMedicamento(nome: string) {
  const medicamentoNome = nome.trim()
  const existente = await prisma.medicamento.findFirst({
    where: { nome: { equals: medicamentoNome, mode: 'insensitive' } },
    select: { id: true },
  })
  return existente ?? prisma.medicamento.create({ data: { nome: medicamentoNome }, select: { id: true } })
}
