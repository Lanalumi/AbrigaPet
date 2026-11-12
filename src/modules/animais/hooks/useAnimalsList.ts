import { api } from '@/lib/http/api'
import { listAnimalsQuerySchema } from '@/schemas/animalSchema'
import { ListAnimalsQuery, ListAnimalsResponse } from '../types'
import { API_URL } from '@/global/constants/api'
import { useListQuery } from '@/global/hooks/useListQuery'

/**
 * Fetches animals list from the API
 */
const fetchAnimalsList = async (query: Partial<ListAnimalsQuery> = {}): Promise<ListAnimalsResponse> => {
  // Use Zod schema to provide defaults
  const validatedQuery = listAnimalsQuerySchema.parse(query)
  const searchParams = new URLSearchParams()

  if (validatedQuery.page) searchParams.set('page', validatedQuery.page.toString())
  if (validatedQuery.pageSize) searchParams.set('pageSize', validatedQuery.pageSize.toString())
  if (validatedQuery.search) searchParams.set('search', validatedQuery.search)
  if (validatedQuery.sortBy) searchParams.set('sortBy', validatedQuery.sortBy)
  if (validatedQuery.sortDir) searchParams.set('sortDir', validatedQuery.sortDir)

  const url = `${API_URL}/animais${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  return api<ListAnimalsResponse>(url)
}

/**
 * React Query hook for fetching animals list
 * Accepts optional query parameters for search, pagination, and sorting
 */
export const useAnimalsList = (query: Partial<ListAnimalsQuery> = {}) => {
  return useListQuery({
    queryKey: ['animais', query],
    queryFn: () => fetchAnimalsList(query),
  })
}
