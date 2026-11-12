import { createPersonSchema, personPublicSchema } from '@/schemas/personSchema'
import { z } from 'zod'

export type CreatePessoa = z.infer<typeof createPersonSchema>

export type Pessoa = z.infer<typeof personPublicSchema>
