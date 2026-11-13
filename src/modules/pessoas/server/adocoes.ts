import { prisma } from '@/lib/db'
import { normalizeMotivoSaida } from '@/schemas/animalSchema'
import { createAdocaoSchema } from '@/schemas/cadastroSchemas'
import { personRole } from '../personRole'

type AdocaoResult = { ok: true } | { ok: false; status: number; message: string }

function availableForAdoption(motivoSaida: string | null) {
  const motivo = normalizeMotivoSaida(motivoSaida)
  return motivo === null || motivo === 'adocao'
}

export async function loadAnimaisDisponiveis() {
  const animais = await prisma.animal.findMany({
    where: { excluidoEm: null, adocoes: { none: {} } },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, motivoSaida: true },
  })

  return animais
    .filter((animal) => availableForAdoption(animal.motivoSaida))
    .map(({ id, nome }) => ({ id, nome }))
}

async function isAdotante(pessoaId: string) {
  const pessoa = await prisma.pessoa.findUnique({ where: { id: pessoaId }, include: { tipo: true } })
  return pessoa !== null && personRole(pessoa.tipo.tipo) === 'adotante'
}

export async function vincularAdocao(pessoaId: string, raw: unknown): Promise<AdocaoResult> {
  const { animalId, dataAdocao } = createAdocaoSchema.parse(raw)

  if (!(await isAdotante(pessoaId))) {
    return { ok: false, status: 404, message: 'Adotante não encontrado' }
  }

  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.findFirst({
      where: { id: animalId, excluidoEm: null, adocoes: { none: {} } },
      select: { motivoSaida: true },
    })

    if (!animal || !availableForAdoption(animal.motivoSaida)) {
      return { ok: false, status: 409, message: 'Animal indisponível para adoção' }
    }

    await tx.adocao.create({ data: { pessoaId, animalId, dataAdocao } })
    await tx.animal.update({ where: { id: animalId }, data: { motivoSaida: 'adocao', dataSaida: dataAdocao } })

    return { ok: true }
  })
}

export async function desvincularAdocao(pessoaId: string, animalId: string): Promise<AdocaoResult> {
  if (!(await isAdotante(pessoaId))) {
    return { ok: false, status: 404, message: 'Adotante não encontrado' }
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.adocao.deleteMany({ where: { pessoaId, animalId } })
    if (count === 0) {
      return { ok: false, status: 404, message: 'Adoção não encontrada' }
    }

    const animal = await tx.animal.findUnique({ where: { id: animalId }, select: { motivoSaida: true } })
    if (animal && normalizeMotivoSaida(animal.motivoSaida) === 'adocao') {
      await tx.animal.update({ where: { id: animalId }, data: { motivoSaida: null, dataSaida: null } })
    }

    return { ok: true }
  })
}
