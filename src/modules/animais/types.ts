import {
  animalPublicSchema,
  animalsListFiltersSchema,
  listAnimalsQuerySchema,
  listAnimalsResponseSchema,
  updateAnimalSchema,
} from '@/schemas/animalSchema'
import { createAnimalSchema } from '@/schemas/cadastroSchemas'

import { z } from 'zod'

export type CreateAnimalForm = z.input<typeof createAnimalSchema>
export type CreateAnimal = z.infer<typeof createAnimalSchema>
export type Animal = z.infer<typeof animalPublicSchema>
export type UpdateAnimal = z.infer<typeof updateAnimalSchema>
export type ListAnimalsQuery = z.infer<typeof listAnimalsQuerySchema>
export type ListAnimalsResponse = z.infer<typeof listAnimalsResponseSchema>
export type AnimalsListFilters = z.infer<typeof animalsListFiltersSchema>
