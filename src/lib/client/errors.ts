import { CLIENT_ERROR_MESSAGES } from '../constants/errors'

export interface ApiErrorResponse {
  error?: string
  message?: string
}

export class ApiError extends Error {
  public status: number
  public response?: Response

  constructor(message: string, status: number, response?: Response) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}

export function handleGenericError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.error('Network error:', error)
    throw new ApiError(CLIENT_ERROR_MESSAGES.NETWORK_ERROR, 0)
  }

  if (error instanceof ApiError) {
    console.error('API error:', error.message, 'Status:', error.status)
    throw error
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    throw new ApiError(CLIENT_ERROR_MESSAGES.UNEXPECTED_ERROR, 500)
  }

  console.error('Unknown error type:', error)
  throw new ApiError(CLIENT_ERROR_MESSAGES.UNEXPECTED_ERROR, 500)
}

export async function processFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = CLIENT_ERROR_MESSAGES.REQUEST_FAILED(response.status)

    try {
      const errorData = (await response.json()) as ApiErrorResponse
      errorMessage = errorData.message ?? errorData.error ?? errorMessage
    } catch {
      errorMessage = response.statusText || errorMessage
    }

    throw new ApiError(errorMessage, response.status, response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return await response.json()
  } catch {
    throw new ApiError(CLIENT_ERROR_MESSAGES.INVALID_RESPONSE_FORMAT, response.status, response)
  }
}
