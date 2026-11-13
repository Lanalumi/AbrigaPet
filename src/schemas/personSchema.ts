import { parseStoredDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import z from 'zod'

function dateSchema(message: string) {
  return z.preprocess((val) => parseStoredDate(val) ?? val, z.date(message))
}

function optionalDateSchema(message: string) {
  return z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return null
    return parseStoredDate(val) ?? val
  }, z.date(message).nullable())
}

export const tipoPessoaSchema = z.object({
  idTipoPessoa: z.uuid(),
  nome: z.enum(['voluntario', 'adotante', 'admin']),
})

export const personRoleSchema = z.enum(['voluntario', 'adotante'], 'Escolha voluntário ou adotante')

export const personEntitySchema = z.object({
  idPessoa: z.uuid(),
  idTipoPessoa: z.uuid('Tipo de pessoa inválido'),
  nome: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  dataNascimento: dateSchema('Data inválida. Use dd/mm/aaaa'),
  endereco: z.string().min(1, 'O endereço é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').nullable().optional(),
})

const personFieldsSchema = {
  nome: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  dataNascimento: dateSchema('Data inválida. Use dd/mm/aaaa'),
  telefone: z.string().min(10, 'Telefone inválido'),
  rua: z.string().min(1, 'A rua é obrigatória'),
  numero: z.coerce.number().int('Número inválido').positive('Número inválido'),
  bairro: z.string().min(1, 'O bairro é obrigatório'),
  cidade: z.string().min(1, 'A cidade é obrigatória'),
  dataInicio: dateSchema('Data inválida. Use dd/mm/aaaa'),
  dataSaida: optionalDateSchema('Data inválida. Use dd/mm/aaaa'),
  email: z.string().trim().optional(),
  senha: z.string().optional(),
}

export const personFormSchema = z.object({
  nome: z.string().trim(),
  cpf: z.string().trim(),
  dataNascimento: z.string().trim(),
  telefone: z.string().trim(),
  rua: z.string().trim(),
  numero: z.string().trim(),
  bairro: z.string().trim(),
  cidade: z.string().trim(),
  dataInicio: z.string().trim(),
  dataSaida: z
    .string()
    .trim()
    .transform((value) => value || null),
  email: z.string().trim(),
  senha: z
    .string()
    .trim()
    .transform((value) => value || undefined),
} satisfies Record<keyof typeof personFieldsSchema, z.ZodType>)

function validateOptionalEmail(email: string | undefined, ctx: z.RefinementCtx) {
  const value = email?.trim() ?? ''
  if (value && !z.string().email().safeParse(value).success) {
    ctx.addIssue({ code: 'custom', path: ['email'], message: 'E-mail inválido' })
  }
}

export const createPersonSchema = z
  .object({
    tipo: personRoleSchema,
    ...personFieldsSchema,
  })
  .superRefine((data, ctx) => {
    validateOptionalEmail(data.email, ctx)
    if (data.tipo !== 'voluntario') return

    if (!data.email?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'E-mail inválido' })
    }

    if (!data.senha || data.senha.length < 6) {
      ctx.addIssue({ code: 'custom', path: ['senha'], message: 'A senha deve ter pelo menos 6 caracteres' })
    }
  })

export const updatePersonFieldsSchema = z.object(personFieldsSchema).superRefine((data, ctx) => {
  validateOptionalEmail(data.email, ctx)
  const senha = data.senha?.trim() ?? ''
  if (senha && senha.length < 6) {
    ctx.addIssue({ code: 'custom', path: ['senha'], message: 'A senha deve ter pelo menos 6 caracteres' })
  }
})

export type PersonFormInput = z.input<typeof personFormSchema>

export const updatePersonSchema = updatePersonFieldsSchema
export const personPublicSchema = personEntitySchema.extend({
  tipo: tipoPessoaSchema.pick({ nome: true }),
})

export const listPeopleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  idTipoPessoa: z.uuid().optional(),
  sortBy: z.enum(['nome', 'dataNascimento']).default('nome'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
})
