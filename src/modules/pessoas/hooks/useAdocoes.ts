'use client'

import { API_URL } from '@/global/constants/api'
import { useMutation } from '@/global/hooks/useMutation'
import { ApiError } from '@/lib/client/errors'
import { api } from '@/lib/http/api'
import { useQueryClient } from '@tanstack/react-query'

type VincularAdocao = { idAdotante: string; animalId: string; dataAdocao: string }
type DesvincularAdocao = { idAdotante: string; animalId: string }

const vincularAdocao = ({ idAdotante, animalId, dataAdocao }: VincularAdocao) =>
  api<{ ok: true }>(`${API_URL}/adotantes/${idAdotante}/adocoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ animalId, dataAdocao }),
  })

const desvincularAdocao = ({ idAdotante, animalId }: DesvincularAdocao) =>
  api<{ ok: true }>(`${API_URL}/adotantes/${idAdotante}/adocoes/${animalId}`, { method: 'DELETE' })

function useInvalidateAnimais() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['animais'] })
}

export const useVincularAdocao = () => {
  const invalidate = useInvalidateAnimais()
  return useMutation<{ ok: true }, ApiError, VincularAdocao>({ mutationFn: vincularAdocao, onSuccess: invalidate })
}

export const useDesvincularAdocao = () => {
  const invalidate = useInvalidateAnimais()
  return useMutation<{ ok: true }, ApiError, DesvincularAdocao>({ mutationFn: desvincularAdocao, onSuccess: invalidate })
}
