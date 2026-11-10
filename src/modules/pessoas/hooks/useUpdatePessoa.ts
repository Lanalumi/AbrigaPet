'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { updatePersonFieldsSchema } from '@/schemas/personSchema'

export type UpdatePersonFields = z.input<typeof updatePersonFieldsSchema>

export type UpdatedPersonFields = {
  id: string
  nome: string
  cpf: string
  telefone: string
  dataNascimento: string
  rua: string
  numero: number
  bairro: string
  cidade: string
  dataInicio: string
  dataSaida: string
  email: string
}

const updatePessoa = async ({ id, updates }: { id: string; updates: UpdatePersonFields }) => {
  return api<UpdatedPersonFields>(`${API_URL}/pessoas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
}

export const useUpdatePessoa = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdatedPersonFields, ApiError, { id: string; updates: UpdatePersonFields }>({
    mutationFn: updatePessoa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] })
      queryClient.invalidateQueries({ queryKey: ['voluntarios'] })
      queryClient.invalidateQueries({ queryKey: ['adotantes'] })
    },
  })
}
