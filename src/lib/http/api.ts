import { processFetchResponse, ApiError, handleGenericError } from '@/lib/client/errors'

export async function api<T>(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<T> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: init?.credentials ?? 'include',
    })
    return await processFetchResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    return handleGenericError(error)
  }
}
