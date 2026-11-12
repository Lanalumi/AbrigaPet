'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'
import { Clinica } from '../types'
import { createClinicaSchema } from '@/schemas/clinicaSchema'
import { z } from 'zod'

export type CreateClinica = z.infer<typeof createClinicaSchema>

const createClinica = async (clinicaData: CreateClinica): Promise<Clinica> => {
  return api<Clinica>(`${API_URL}/clinicas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clinicaData),
  })
}

export const useCreateClinica = () => {
  const queryClient = useQueryClient()

  return useMutation<Clinica, ApiError, CreateClinica>({
    mutationFn: createClinica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicas'] })
    },
  })
}
