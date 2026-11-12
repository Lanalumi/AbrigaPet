import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'

const deleteClinica = async (idClinica: string): Promise<void> => {
  const url = `${API_URL}/clinicas/${idClinica}`
  await api<void>(url, {
    method: 'DELETE',
  })
}

export const useDeleteClinica = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClinica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicas'] })
    },
  })
}
