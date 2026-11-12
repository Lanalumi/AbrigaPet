'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'

export type DeleteGatilResponse = { id: string; action: 'excluido' | 'desativado' }

const deleteGatil = async (id: string): Promise<DeleteGatilResponse> => {
  return api<DeleteGatilResponse>(`${API_URL}/gatis/${id}`, {
    method: 'DELETE',
  })
}

export const useDeleteGatil = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteGatilResponse, ApiError, string>({
    mutationFn: deleteGatil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatis'] })
    },
  })
}
