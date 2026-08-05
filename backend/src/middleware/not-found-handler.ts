import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../shared/app-error.js'

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(new AppError(404, 'NOT_FOUND', `Route ${request.method} ${request.path} was not found`))
}
