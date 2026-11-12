import {
  listLocalizacoesQuerySchema,
  listLocalizacoesResponseSchema,
  localizacaoPublicSchema,
  localizacoesListFiltersSchema,
} from '@/schemas/localizacaoSchema'
import { z } from 'zod'

export type Localizacao = z.infer<typeof localizacaoPublicSchema>
export type ListLocalizacoesQuery = z.infer<typeof listLocalizacoesQuerySchema>
export type ListLocalizacoesResponse = z.infer<typeof listLocalizacoesResponseSchema>
export type LocalizacoesListFilters = z.infer<typeof localizacoesListFiltersSchema>
