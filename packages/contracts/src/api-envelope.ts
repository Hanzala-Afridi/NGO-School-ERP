export interface SuccessResponse<T> {
  success: true
  data: T
  meta: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  details: unknown[]
}

export interface ErrorResponse {
  success: false
  error: ApiError
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
