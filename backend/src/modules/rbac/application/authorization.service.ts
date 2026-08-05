import { AppError } from '../../../shared/app-error.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { RecordScope } from '../domain/authorization.js'

export class AuthorizationService {
  requirePermission(context: AuthContext, permission: string): void {
    if (!context.permissions.has(permission)) {
      throw new AppError(403, 'FORBIDDEN', 'You are not authorized to perform this action')
    }
  }

  enforceScope(context: AuthContext, scope: RecordScope): void {
    if (scope.kind === 'all') {
      if (context.roles.some((role) => role.name === 'Admin')) return
    } else if (scope.kind === 'self') {
      if (context.profile.id === scope.targetProfileId) return
    }
    throw new AppError(403, 'RECORD_SCOPE_DENIED', 'The requested record is outside your scope')
  }
}
