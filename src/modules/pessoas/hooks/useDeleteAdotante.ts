import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'

const deleteAdotante = async (idAdotante: string): Promise<void> => {
  const url = `${API_URL}/adotantes/${idAdotante}`
  await api<void>(url, {
    method: 'DELETE',
  })
}

export const useDeleteAdotante = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAdotante,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adotantes'] })
    },
  })
}
