import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'

const deleteVoluntario = async (idVoluntario: string): Promise<void> => {
  const url = `${API_URL}/voluntarios/${idVoluntario}`
  await api<void>(url, {
    method: 'DELETE',
  })
}

export const useDeleteVoluntario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVoluntario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voluntarios'] })
    },
  })
}
