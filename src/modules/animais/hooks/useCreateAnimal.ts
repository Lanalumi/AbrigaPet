'use client'

import { useMutation } from '@/global/hooks/useMutation'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/http/api'
import { CreateAnimal, Animal } from '../types'
import { API_URL } from '@/global/constants/api'
import { ApiError } from '@/lib/client/errors'

const createAnimal = async (animalData: CreateAnimal): Promise<Animal> => {
  const url = `${API_URL}/animais`
  return api<Animal>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animalData),
  })
}

export const useCreateAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation<Animal, ApiError, CreateAnimal>({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animais'] })
    },
  })
}
