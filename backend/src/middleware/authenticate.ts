import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../shared/app-error.js'
import type { AuthenticationService } from '../modules/auth/application/authentication.service.js'

function metadata(request: Request) {
  const requestId =
    typeof request.id === 'string'
      ? request.id
      : typeof request.id === 'number'
        ? request.id.toString()
        : undefined
  return {
    requestId,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  }
}

export function authenticate(authentication: AuthenticationService) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const header = request.get('authorization')
      if (!header?.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required')
      }
      const token = header.slice('Bearer '.length).trim()
      if (!token) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required')
      request.auth = await authentication.authenticate(token, metadata(request))
      next()
    } catch (error) {
      next(error)
    }
  }
}
