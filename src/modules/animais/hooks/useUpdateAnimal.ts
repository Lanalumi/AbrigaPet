import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/http/api'
import { API_URL } from '@/global/constants/api'
import { ApiError } from '@/lib/client/errors'
import { UpdateAnimal, Animal } from '../types'

const updateAnimal = async ({
  idAnimal,
  updates,
}: {
  idAnimal: string
  updates: Partial<UpdateAnimal>
}): Promise<Animal> => {
  const url = `${API_URL}/animais/${idAnimal}`
  return api<Animal>(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
}

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation<Animal, ApiError, { idAnimal: string; updates: Partial<UpdateAnimal> }>({
    mutationFn: updateAnimal,
    onSuccess: (updatedAnimal, variables) => {
      queryClient.invalidateQueries({ queryKey: ['animais'] })

      queryClient.setQueryData(['animais', variables.idAnimal], updatedAnimal)
    },
  })
}
