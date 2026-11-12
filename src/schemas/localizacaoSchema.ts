import z from 'zod'

export const createLocalizacaoSchema = z.object({
  tipoLocal: z.string().trim().min(1, 'O tipo de local é obrigatório'),
  nome: z.string().trim().min(1, 'O nome é obrigatório'),
})

export const localizacaoPublicSchema = z.object({
  id: z.uuid(),
  tipoLocal: z.string(),
  nome: z.string(),
  ativo: z.boolean(),
})

export const updateLocalizacaoSchema = createLocalizacaoSchema.extend({
  ativo: z.boolean(),
})

export const localizacaoListItemSchema = localizacaoPublicSchema.extend({
  totalAnimais: z.number().int().nonnegative().default(0),
})

export const listLocalizacoesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['nome', 'tipoLocal']).default('nome'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
})

export const listLocalizacoesResponseSchema = z.object({
  items: z.array(localizacaoListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export const localizacoesListFiltersSchema = listLocalizacoesQuerySchema
  .pick({
    search: true,
    sortBy: true,
    sortDir: true,
  })
  .partial()

function parseEntradaDate(val: unknown) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return new Date(Date.UTC(val.getFullYear(), val.getMonth(), val.getDate()))
  }

  if (typeof val !== 'string') return val

  const brazilian = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val.trim())
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

export const createHistoricoLocalSchema = z.object({
  localizacaoId: z.string().trim().min(1, 'Selecione o local').pipe(z.uuid('Selecione o local')),
  dataEntrada: z.preprocess(parseEntradaDate, z.date('Data inválida. Use dd/mm/aaaa')),
})

export const localOpcaoSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  tipoLocal: z.string(),
})

export const historicoLocalRegistroSchema = z.object({
  id: z.uuid(),
  localizacaoId: z.uuid(),
  nome: z.string(),
  tipoLocal: z.string(),
  status: z.string(),
  dataEntrada: z.coerce.date(),
  dataSaida: z.coerce.date().nullable(),
})

export const historicoLocalResumoSchema = z.object({
  atual: historicoLocalRegistroSchema.nullable(),
  historico: z.array(historicoLocalRegistroSchema),
  locais: z.array(localOpcaoSchema),
})

export type CreateHistoricoLocal = z.infer<typeof createHistoricoLocalSchema>
export type LocalOpcao = z.infer<typeof localOpcaoSchema>
export type HistoricoLocalRegistro = z.infer<typeof historicoLocalRegistroSchema>
export type HistoricoLocalResumo = z.infer<typeof historicoLocalResumoSchema>
