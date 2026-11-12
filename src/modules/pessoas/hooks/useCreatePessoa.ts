'use client'

import { API_URL } from '@/global/constants/api'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { CreatePessoa, Pessoa } from '@/modules/pessoas/types'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/global/hooks/useMutation'

const createPessoa = async (pessoaData: CreatePessoa): Promise<Pessoa> => {
  const url = `${API_URL}/pessoas`
  return api<Pessoa>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pessoaData),
  })
}

export const useCreatePessoa = () => {
  const queryClient = useQueryClient()

  return useMutation<Pessoa, ApiError, CreatePessoa>({
    mutationFn: createPessoa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] })
    },
  })
}
