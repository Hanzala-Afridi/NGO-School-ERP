import type { ErrorResponse, SuccessResponse } from '@ngo-school-erp/contracts'

export function successResponse<T>(
  data: T,
  meta: Record<string, unknown> = {},
): SuccessResponse<T> {
  return { success: true, data, meta }
}

export function errorResponse(
  code: string,
  message: string,
  details: unknown[] = [],
): ErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  }
}
