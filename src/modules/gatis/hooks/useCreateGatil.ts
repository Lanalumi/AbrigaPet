'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { createLocalizacaoSchema } from '@/schemas/localizacaoSchema'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Localizacao } from '../types'

export type CreateLocalizacao = z.infer<typeof createLocalizacaoSchema>

const createGatil = async (data: CreateLocalizacao): Promise<Localizacao> => {
  return api<Localizacao>(`${API_URL}/gatis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const useCreateGatil = () => {
  const queryClient = useQueryClient()

  return useMutation<Localizacao, ApiError, CreateLocalizacao>({
    mutationFn: createGatil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatis'] })
    },
  })
}
