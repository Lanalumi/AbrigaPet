'use client'

import { API_URL } from '@/global/constants/api'
import { useListQuery } from '@/global/hooks/useListQuery'
import { api } from '@/lib/http/api'
import { listLocalizacoesQuerySchema } from '@/schemas/localizacaoSchema'
import { ListLocalizacoesQuery, ListLocalizacoesResponse } from '../types'

const fetchGatisList = async (query: Partial<ListLocalizacoesQuery> = {}): Promise<ListLocalizacoesResponse> => {
  const validatedQuery = listLocalizacoesQuerySchema.parse(query)
  const searchParams = new URLSearchParams()

  if (validatedQuery.page) searchParams.set('page', validatedQuery.page.toString())
  if (validatedQuery.pageSize) searchParams.set('pageSize', validatedQuery.pageSize.toString())
  if (validatedQuery.search) searchParams.set('search', validatedQuery.search)
  if (validatedQuery.sortBy) searchParams.set('sortBy', validatedQuery.sortBy)
  if (validatedQuery.sortDir) searchParams.set('sortDir', validatedQuery.sortDir)

  const url = `${API_URL}/gatis${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  return api<ListLocalizacoesResponse>(url)
}

export const useGatisList = (query: Partial<ListLocalizacoesQuery> = {}) => {
  return useListQuery({
    queryKey: ['gatis', query],
    queryFn: () => fetchGatisList(query),
  })
}
