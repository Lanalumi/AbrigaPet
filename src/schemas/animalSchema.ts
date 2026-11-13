import z from 'zod'

function asDate(val: unknown) {
  if (val instanceof Date) return val
  return new Date(val as string)
}

function asOptionalDate(val: unknown) {
  if (val === null || val === undefined || val === '') return null
  return asDate(val)
}

export const motivoSaidaValues = ['falecimento', 'adocao', 'saiu'] as const

export const motivoSaidaLabel = {
  falecimento: 'Falecimento',
  adocao: 'Adoção',
  saiu: 'Saiu',
} as const

const obitoTerms = new Set(['obito', 'morte', 'morreu', 'faleceu', 'falecimento', 'eutanasia'])
const adocaoTerms = new Set(['adocao', 'adotado', 'adotada'])

function fold(value: string) {
  return value.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function motivoFromSearch(search: string) {
  const normalized = fold(search)
  if (!normalized) return null
  if (obitoTerms.has(normalized)) return 'falecimento' as const
  if (adocaoTerms.has(normalized)) return 'adocao' as const
  if (normalized === 'saiu') return 'saiu' as const
  return null
}

export function normalizeMotivoSaida(value: string | null | undefined) {
  const motivo = value?.trim() ?? ''
  if (!motivo) return null

  const known = motivoFromSearch(motivo)
  if (known) return known

  const normalized = fold(motivo)
  if (/obito|morte|morreu|faleceu|falecimento|eutanasia/.test(normalized)) return 'falecimento' as const
  if (/adoc/.test(normalized)) return 'adocao' as const
  return 'saiu' as const
}

export function saidaPairError(motivoSaida: string | null | undefined, dataSaida: Date | null | undefined) {
  const hasMotivo = Boolean(motivoSaida)
  const hasData = dataSaida instanceof Date && !Number.isNaN(dataSaida.getTime())
  if (hasMotivo === hasData) return null
  return hasMotivo ? 'Informe a data de saída' : 'Selecione o motivo de saída'
}

export function readSaidaFields(motivo: string, data: string, parseDate: (value: string) => Date | null) {
  const motivoSaida = normalizeMotivoSaida(motivo)
  const trimmed = data.trim()

  if (!motivoSaida && !trimmed) {
    return { ok: true as const, motivoSaida: null, dataSaida: null }
  }

  if (!motivoSaida) {
    return { ok: false as const, field: 'motivoSaida' as const, message: 'Selecione o motivo de saída' }
  }

  if (!trimmed) {
    return { ok: false as const, field: 'dataSaida' as const, message: 'Informe a data de saída' }
  }

  const dataSaida = parseDate(trimmed)
  if (!dataSaida) {
    return { ok: false as const, field: 'dataSaida' as const, message: 'Data inválida. Use dd/mm/aaaa' }
  }

  return { ok: true as const, motivoSaida, dataSaida }
}

const animalFields = {
  nome: z.string().min(1, 'Nome do animal é obrigatório'),
  sexo: z.boolean(),
  cor: z.string().min(1, 'A cor é obrigatória'),
  raca: z.string().min(1, 'A raça é obrigatória'),
  pelagem: z.string().min(1, 'A pelagem é obrigatória'),
  dataNascimento: z.preprocess(asOptionalDate, z.date().nullable()),
  dataChegada: z.preprocess(asDate, z.date()),
  dataSaida: z.preprocess(asOptionalDate, z.date().nullable()),
  fivFelv: z.boolean(),
  foto: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url('A foto deve ser uma URL válida').nullable().optional(),
  ),
  especie: z.string().min(1),
  motivoSaida: z.preprocess(
    (val) => {
      if (val == null || val === '') return null
      if (typeof val !== 'string') return val
      return normalizeMotivoSaida(val)
    },
    z.enum(['falecimento', 'adocao', 'saiu']).nullable(),
  ),
}

export const animalEntitySchema = z.object({
  id: z.uuid(),
  ...animalFields,
})

export const situacaoAnimalSchema = z.enum(['abrigo', 'adotado', 'obito', 'saiu'])

export function deriveSituacao(motivoSaida: string | null | undefined, adotado: boolean) {
  const motivo = normalizeMotivoSaida(motivoSaida)
  if (motivo === 'falecimento') return 'obito' as const
  if (motivo === 'adocao') return 'adotado' as const
  if (motivo === 'saiu') return 'saiu' as const
  if (adotado) return 'adotado' as const
  return 'abrigo' as const
}

export const situacaoAnimalLabel = {
  abrigo: 'Disponível',
  adotado: 'Adoção',
  obito: 'Falecimento',
  saiu: 'Saiu',
} as const

export const animalPublicSchema = animalEntitySchema.extend({
  localizacaoAtual: z.string().nullable().optional(),
  adotado: z.boolean(),
  situacao: situacaoAnimalSchema,
})

export const updateAnimalSchema = z.object(animalFields)
export const listAnimalsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['dataChegada', 'nome', 'dataNascimento', 'sexo']).default('dataChegada'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
})

export const listAnimalsResponseSchema = z.object({
  items: z.array(animalPublicSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Extract only the filter fields for form validation (not pagination)
export const animalsListFiltersSchema = listAnimalsQuerySchema
  .pick({
    search: true,
    sortBy: true,
    sortDir: true,
  })
  .partial()
