import type { NextFunction, Request, Response } from 'express'

import type { AuditService } from '../modules/audit/application/audit.service.js'
import type { AuthorizationService } from '../modules/rbac/application/authorization.service.js'
import type { RecordScope } from '../modules/rbac/domain/authorization.js'
import { AppError } from '../shared/app-error.js'

export function enforceRecordScope(
  authorization: AuthorizationService,
  audit: AuditService,
  resolve: (request: Request) => RecordScope,
) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      if (!request.auth) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required')
      authorization.enforceScope(request.auth, resolve(request))
      next()
    } catch (error) {
      if (request.auth) {
        const requestId =
          typeof request.id === 'string'
            ? request.id
            : typeof request.id === 'number'
              ? request.id.toString()
              : undefined
        await audit.record({
          actorProfileId: request.auth.profile.id,
          action: 'authorization.scope.denied',
          outcome: 'denied',
          reasonCode: resolve(request).kind,
          requestId,
          sessionId: request.auth.sessionId,
          ipAddress: request.ip,
          userAgent: request.get('user-agent'),
        })
      }
      next(error)
    }
  }
}
