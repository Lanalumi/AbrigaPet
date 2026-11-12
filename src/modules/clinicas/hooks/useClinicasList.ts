import { API_URL } from '@/global/constants/api'
import { useListQuery } from '@/global/hooks/useListQuery'
import { api } from '@/lib/http/api'
import { listClinicasQuerySchema } from '@/schemas/clinicaSchema'
import { ListClinicasQuery, ListClinicasResponse } from '../types'

const fetchClinicasList = async (query: Partial<ListClinicasQuery> = {}): Promise<ListClinicasResponse> => {
  const validatedQuery = listClinicasQuerySchema.parse(query)
  const searchParams = new URLSearchParams()

  if (validatedQuery.page) searchParams.set('page', validatedQuery.page.toString())
  if (validatedQuery.pageSize) searchParams.set('pageSize', validatedQuery.pageSize.toString())
  if (validatedQuery.search) searchParams.set('search', validatedQuery.search)
  if (validatedQuery.sortBy) searchParams.set('sortBy', validatedQuery.sortBy)
  if (validatedQuery.sortDir) searchParams.set('sortDir', validatedQuery.sortDir)

  const url = `${API_URL}/clinicas${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  return api<ListClinicasResponse>(url)
}

export const useClinicasList = (query: Partial<ListClinicasQuery> = {}) => {
  return useListQuery({
    queryKey: ['clinicas', query],
    queryFn: () => fetchClinicasList(query),
  })
}
