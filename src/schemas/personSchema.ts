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
  email: z.string().email('E-mail inválido'),
})

export const createPersonSchema = z.object({
  tipo: personRoleSchema,
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
})
export const updatePersonSchema = createPersonSchema
export const updatePersonFieldsSchema = createPersonSchema.omit({ tipo: true })
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
