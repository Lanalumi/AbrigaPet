'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { updateLocalizacaoSchema } from '@/schemas/localizacaoSchema'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Localizacao } from '../types'

export type UpdateLocalizacao = z.infer<typeof updateLocalizacaoSchema>

const updateGatil = async ({ id, data }: { id: string; data: UpdateLocalizacao }): Promise<Localizacao> => {
  return api<Localizacao>(`${API_URL}/gatis/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const useUpdateGatil = () => {
  const queryClient = useQueryClient()

  return useMutation<Localizacao, ApiError, { id: string; data: UpdateLocalizacao }>({
    mutationFn: updateGatil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatis'] })
    },
  })
}
