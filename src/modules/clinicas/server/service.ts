import { clinicaPublicSchema, createClinicaSchema, listClinicasResponseSchema } from '@/schemas/clinicaSchema'
import { clinicaCreate, clinicaDelete, clinicaFindById, clinicaFindMany, clinicaUpdate } from './repo'

export async function listClinicas(rawQuery: unknown) {
  const response = await clinicaFindMany(rawQuery)
  const clinicas = response.items.map((row) => clinicaPublicSchema.parse(row))
  return listClinicasResponseSchema.parse({ ...response, items: clinicas })
}

export async function createClinica(raw: unknown) {
  const data = createClinicaSchema.parse(raw)
  const created = await clinicaCreate(data)
  return clinicaPublicSchema.parse(created)
}

export async function getClinicaById(id: string) {
  const row = await clinicaFindById(id)
  if (!row) return null
  return clinicaPublicSchema.parse(row)
}

export async function updateClinicaById(id: string, raw: unknown) {
  const data = createClinicaSchema.parse(raw)
  const updated = await clinicaUpdate(id, data)
  return clinicaPublicSchema.parse(updated)
}

export async function deleteClinicaById(id: string) {
  await clinicaDelete(id)
}
