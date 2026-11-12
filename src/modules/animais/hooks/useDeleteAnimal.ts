import { useMutation } from '@/global/hooks/useMutation'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/http/api'
import { API_URL } from '@/global/constants/api'

const deleteAnimal = async (idAnimal: string): Promise<void> => {
  const url = `${API_URL}/animais/${idAnimal}`
  await api<void>(url, {
    method: 'DELETE',
  })
}

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animais'] })
    },
  })
}
