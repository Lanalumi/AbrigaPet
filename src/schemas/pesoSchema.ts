import z from 'zod'

function parsePesoValue(val: unknown) {
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return Number.NaN

  const normalized = val.trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return Number.NaN

  return Number(normalized)
}

function parsePesagemDate(val: unknown) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return new Date(Date.UTC(val.getFullYear(), val.getMonth(), val.getDate()))
  }

  if (typeof val !== 'string') return val

  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val.trim())
  if (brazilian) {
    const day = Number(brazilian[1])
    const month = Number(brazilian[2])
    const year = Number(brazilian[3])
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return val
    return date
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(val.trim())
  if (!iso) return val

  const year = Number(iso[1])
  const month = Number(iso[2])
  const day = Number(iso[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return val
  return date
}

export const createPesoSchema = z.object({
  quantidadePeso: z.preprocess(parsePesoValue, z.number('Informe o peso').positive('O peso deve ser maior que zero')),
  dataPesagem: z.preprocess(parsePesagemDate, z.date('Data de pesagem inválida. Use dd/mm/aaaa')),
})

export const pesoSchema = z.object({
  id: z.uuid(),
  animalId: z.uuid(),
  quantidadePeso: z.number().positive('O peso deve ser maior que zero'),
})

export const historicoPesoSchema = z.object({
  id: z.uuid(),
  animalId: z.uuid(),
  pesoId: z.uuid(),
  status: z.string().trim().min(1, 'Informe o status'),
  dataPesagem: z.coerce.date('Data de pesagem inválida. Use dd/mm/aaaa'),
})

export const pesoRegistroSchema = z.object({
  id: z.uuid(),
  quantidadePeso: z.number().positive('O peso deve ser maior que zero'),
  status: z.string(),
  dataPesagem: z.coerce.date(),
})

export const pesoResumoSchema = z.object({
  atual: pesoRegistroSchema.nullable(),
  historico: z.array(pesoRegistroSchema),
})

export type CreatePeso = z.infer<typeof createPesoSchema>
export type Peso = z.infer<typeof pesoSchema>
export type HistoricoPeso = z.infer<typeof historicoPesoSchema>
export type PesoRegistro = z.infer<typeof pesoRegistroSchema>
export type PesoResumo = z.infer<typeof pesoResumoSchema>
