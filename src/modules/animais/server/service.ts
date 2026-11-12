import { createAnimalSchema, idSchema } from '@/schemas/cadastroSchemas'
import {
  animalEntitySchema,
  animalPublicSchema,
  deriveSituacao,
  listAnimalsQuerySchema,
  listAnimalsResponseSchema,
  updateAnimalSchema,
} from '@/schemas/animalSchema'
import { animalById, animalCreate, animalFindMany, animalSoftDelete, animalUpdate } from './repo'

export async function createAnimal(raw: unknown) {
  const animal = createAnimalSchema.parse(raw)

  const created = await animalCreate(animal)

  return created
}

function currentLocationName(row: unknown): string | null {
  if (!row || typeof row !== 'object' || !('historicosLocalizacao' in row)) return null

  const historicos = (
    row as {
      historicosLocalizacao?: Array<{
        dataSaida?: Date | null
        localizacao?: { nome?: string | null; tipoLocal?: string | null } | null
      }>
    }
  ).historicosLocalizacao

  const current = historicos?.find((item) => item.dataSaida == null)
  const name = current?.localizacao?.nome?.trim() || current?.localizacao?.tipoLocal?.trim()
  return name || null
}

function adopted(row: unknown) {
  if (!row || typeof row !== 'object' || !('_count' in row)) return false

  const count = (row as { _count?: { adocoes?: number } })._count?.adocoes
  return (count ?? 0) > 0
}

function toPublic(row: unknown) {
  const entity = animalEntitySchema.parse(row)
  const adotado = adopted(row)

  return animalPublicSchema.parse({
    ...entity,
    dataChegada: entity.dataChegada.toISOString(),
    dataNascimento: entity.dataNascimento ? entity.dataNascimento.toISOString() : null,
    localizacaoAtual: currentLocationName(row),
    adotado,
    situacao: deriveSituacao(entity.motivoSaida, adotado),
  })
}
export async function listAnimals(rawQuery: unknown) {
  const query = listAnimalsQuerySchema.parse(rawQuery)
  const response = await animalFindMany(query)
  const animals = response.items.map(toPublic)
  return listAnimalsResponseSchema.parse({ ...response, items: animals })
}

export async function getAnimalById(raw: unknown) {
  const id = idSchema.parse(raw)
  const foundAnimal = await animalById(id)
  if (!foundAnimal) return null

  return toPublic(foundAnimal)
}

export async function updateAnimalById(id: string, raw: unknown) {
  const existingAnimal = await animalById(id)

  if (!existingAnimal) throw new Error('Animal not found')

  const patch = updateAnimalSchema.parse(raw)

  const prismaPatch: Record<string, unknown> = {}

  if (typeof patch.nome !== 'undefined') {
    prismaPatch.nome = patch.nome.trim()
  }

  const updatedAnimal = await animalUpdate(existingAnimal.id, prismaPatch)

  return toPublic(updatedAnimal)
}

export async function deleteAnimalById(id: string) {
  const existingAnimal = await animalById(id)

  if (!existingAnimal) return false

  await animalSoftDelete(existingAnimal.id)

  return true
}
