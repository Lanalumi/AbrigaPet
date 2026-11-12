'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { createClinicaSchema } from '@/schemas/clinicaSchema'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Clinica } from '../types'

export type UpdateClinicaFields = z.input<typeof createClinicaSchema>

const updateClinica = async ({ id, updates }: { id: string; updates: UpdateClinicaFields }) => {
  return api<Clinica>(`${API_URL}/clinicas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
}

export const useUpdateClinica = () => {
  const queryClient = useQueryClient()

  return useMutation<Clinica, ApiError, { id: string; updates: UpdateClinicaFields }>({
    mutationFn: updateClinica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicas'] })
    },
  })
}
