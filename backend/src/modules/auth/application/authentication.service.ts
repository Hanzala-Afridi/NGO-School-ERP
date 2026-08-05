import type { AuthSession, CurrentIdentity } from '@ngo-school-erp/contracts'

import { environment } from '../../../config/env.js'
import { AppError } from '../../../shared/app-error.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { IdentityRepository } from '../../identity/domain/profile.js'
import type { RbacRepository } from '../../rbac/domain/authorization.js'
import type { AuthContext } from '../domain/auth-context.js'
import type { SupabaseAuthGateway } from '../infrastructure/supabase-auth.gateway.js'

export interface RequestSecurityMetadata {
  requestId?: string
  ipAddress?: string
  userAgent?: string
}

export class AuthenticationService {
  constructor(
    private readonly gateway: SupabaseAuthGateway,
    private readonly identities: IdentityRepository,
    private readonly rbac: RbacRepository,
    private readonly audit: AuditService,
  ) {}

  async login(
    email: string,
    password: string,
    metadata: RequestSecurityMetadata,
  ): Promise<AuthSession> {
    try {
      const session = await this.gateway.signIn(email, password)
      const verified = await this.gateway.verify(session.accessToken)
      const profile = await this.identities.findAuthorizationIdentity(verified.user.id)
      if (!profile || profile.status !== 'active' || profile.roles.length === 0) {
        await this.gateway.logout(session.accessToken)
        throw new Error(profile?.status === 'inactive' ? 'ACCOUNT_INACTIVE' : 'ACCOUNT_UNASSIGNED')
      }
      await this.audit.record({
        ...metadata,
        actorProfileId: profile.id,
        action: 'auth.login',
        outcome: 'success',
        sessionId: verified.sessionId,
      })
      return session
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'LOGIN_FAILED'
      await this.audit.record({
        ...metadata,
        action: 'auth.login',
        outcome: 'failure',
        reasonCode: reason,
      })
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
    }
  }

  async authenticate(accessToken: string, metadata: RequestSecurityMetadata): Promise<AuthContext> {
    try {
      const verified = await this.gateway.verify(accessToken)
      const profile = await this.identities.findAuthorizationIdentity(verified.user.id)
      if (!profile) throw new Error('ACCOUNT_UNASSIGNED')
      if (profile.status !== 'active') throw new Error('ACCOUNT_INACTIVE')
      if (profile.roles.length === 0) throw new Error('ACCOUNT_UNASSIGNED')
      const assignedRoleIds = new Set(profile.roles.map((role) => role.id))
      const permissions = new Set(
        (await this.rbac.listRoles())
          .filter((role) => assignedRoleIds.has(role.id))
          .flatMap((role) => role.permissions.map((permission) => permission.key)),
      )
      const context: AuthContext = {
        accessToken,
        sessionId: verified.sessionId,
        profile,
        roles: profile.roles,
        permissions,
      }
      await this.audit.record({
        ...metadata,
        actorProfileId: profile.id,
        action: 'auth.session.accepted',
        outcome: 'success',
        sessionId: verified.sessionId,
      })
      return context
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'INVALID_ACCESS_TOKEN'
      await this.audit.record({
        ...metadata,
        action: reason === 'ACCOUNT_INACTIVE' ? 'auth.account.inactive' : 'auth.token.rejected',
        outcome: 'denied',
        reasonCode: reason,
      })
      throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required')
    }
  }

  currentIdentity(context: AuthContext): CurrentIdentity {
    return {
      profile: context.profile,
      roles: context.roles,
      permissions: [...context.permissions].sort(),
    }
  }

  async requestPasswordRecovery(email: string, metadata: RequestSecurityMetadata): Promise<void> {
    let outcome: 'success' | 'failure' = 'success'
    let reasonCode: string | undefined
    try {
      await this.gateway.requestPasswordRecovery(
        email,
        `${environment.FRONTEND_URL}/auth/callback?next=/reset-password`,
      )
    } catch {
      outcome = 'failure'
      reasonCode = 'PASSWORD_RECOVERY_PROVIDER_FAILED'
    }
    await this.audit.record({
      ...metadata,
      action: 'auth.password_recovery.requested',
      outcome,
      reasonCode,
    })
  }

  async updatePassword(
    context: AuthContext,
    password: string,
    metadata: RequestSecurityMetadata,
  ): Promise<void> {
    await this.gateway.updatePassword(context.profile.authUserId, password)
    await this.audit.record({
      ...metadata,
      actorProfileId: context.profile.id,
      action: 'auth.password.updated',
      outcome: 'success',
      sessionId: context.sessionId,
    })
  }

  async logout(context: AuthContext, metadata: RequestSecurityMetadata): Promise<void> {
    await this.gateway.logout(context.accessToken)
    await this.audit.record({
      ...metadata,
      actorProfileId: context.profile.id,
      action: 'auth.logout',
      outcome: 'success',
      sessionId: context.sessionId,
    })
  }
}
