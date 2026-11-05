import { parseStoredDate } from '@/modules/pessoas/components/FormNewPerson/functions/parseDate'
import { z } from 'zod'
import { updateAnimalSchema } from './animalSchema'

export const idSchema = z.string().uuid('ID inválido')

export const createAnimalSchema = updateAnimalSchema

export const createAdocaoSchema = z.object({
  animalId: z.string().uuid('Selecione um animal'),
  dataAdocao: z.preprocess((val) => parseStoredDate(val) ?? val, z.date('Data inválida. Use dd/mm/aaaa')),
})

export const createFichaMedicaSchema = z.object({
  consultaId: z.string().uuid('ID da consulta inválido'),
  castracao: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  vermifucacao: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  vacina: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
})

export type CreateAdocao = z.infer<typeof createAdocaoSchema>
export type CreateFichaMedica = z.infer<typeof createFichaMedicaSchema>
