import {
  clinicaPublicSchema,
  clinicasListFiltersSchema,
  listClinicasQuerySchema,
  listClinicasResponseSchema,
} from '@/schemas/clinicaSchema'
import { z } from 'zod'

export type Clinica = z.infer<typeof clinicaPublicSchema>
export type ListClinicasQuery = z.infer<typeof listClinicasQuerySchema>
export type ListClinicasResponse = z.infer<typeof listClinicasResponseSchema>
export type ClinicasListFilters = z.infer<typeof clinicasListFiltersSchema>
