export const CLIENT_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',

  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',

  REQUEST_FAILED: (status: number) => `Request failed with status ${status}`,
  INVALID_RESPONSE_FORMAT: 'Invalid response format',

  NOT_FOUND_DEFAULT: 'Not found',
  UNIQUE_CONSTRAINT_FAILED: 'Unique constraint failed',
  RECORD_NOT_FOUND: 'Record not found',
} as const
