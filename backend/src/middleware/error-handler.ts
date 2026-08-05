import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import { AppError } from '../shared/app-error.js'
import { errorResponse } from '../shared/api-response.js'
import { logger } from '../shared/logger.js'

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  void _next

  if (error instanceof ZodError) {
    response.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Request validation failed',
        error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      ),
    )
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json(errorResponse(error.code, error.message, error.details))
    return
  }

  logger.error(
    {
      err: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
      requestId: request.id,
    },
    'Unhandled request error',
  )
  response.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred'))
}
