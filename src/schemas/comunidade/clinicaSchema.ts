import z from 'zod'

const clinicaFields = {
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  cnpj: z.string().trim().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  telefone: z.string().trim().min(10, 'Telefone inválido'),
  rua: z.string().trim().min(1, 'A rua é obrigatória'),
  numero: z.coerce.number('Número inválido').int('Número inválido').positive('Número inválido'),
  bairro: z.string().trim().min(1, 'O bairro é obrigatório'),
  cidade: z.string().trim().min(1, 'A cidade é obrigatória'),
}

export const createClinicaSchema = z.object(clinicaFields)

export const clinicaPublicSchema = z.object({
  id: z.uuid(),
  ...clinicaFields,
})

export const listClinicasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['nome', 'cidade', 'cnpj']).default('nome'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
})

export const listClinicasResponseSchema = z.object({
  items: z.array(clinicaPublicSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export const clinicasListFiltersSchema = listClinicasQuerySchema
  .pick({
    search: true,
    sortBy: true,
    sortDir: true,
  })
  .partial()
