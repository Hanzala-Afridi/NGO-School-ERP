import type { AuthProfile, PaginatedUsers, UserSummary } from '@ngo-school-erp/contracts'

import { environment } from '../../../config/env.js'
import { AppError } from '../../../shared/app-error.js'
import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { SupabaseAuthGateway } from '../../auth/infrastructure/supabase-auth.gateway.js'
import type { IdentityRepository } from '../domain/profile.js'

export class IdentityService {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly authGateway: SupabaseAuthGateway,
    private readonly audit: AuditService,
  ) {}

  async list(input: { page: number; pageSize: number; search?: string }): Promise<PaginatedUsers> {
    const result = await this.repository.list(input)
    return { ...result, page: input.page, pageSize: input.pageSize }
  }

  async get(id: string): Promise<UserSummary> {
    const profile = await this.repository.findById(id)
    if (!profile) throw new AppError(404, 'USER_NOT_FOUND', 'User was not found')
    return profile
  }

  async invite(
    actor: AuthContext,
    input: { email: string; fullName: string; roleIds: string[] },
  ): Promise<UserSummary> {
    const user = await this.authGateway.inviteUser(
      input.email,
      input.fullName,
      `${environment.FRONTEND_URL}/auth/callback?next=/reset-password`,
    )
    const profile = await this.repository.findAuthorizationIdentity(user.id)
    if (!profile) {
      throw new AppError(
        503,
        'PROFILE_PROVISIONING_FAILED',
        'The Auth user was invited but its profile is not ready; retry role assignment',
      )
    }
    const assigned = await this.repository.replaceRoles(profile.id, input.roleIds, actor.profile.id)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'identity.user.invited',
      outcome: 'success',
      entityType: 'profile',
      entityId: profile.id,
      newValues: { roleIds: input.roleIds },
      sessionId: actor.sessionId,
    })
    return assigned
  }

  async update(
    actor: AuthContext,
    id: string,
    patch: { fullName?: string; phone?: string | null; profileImageUrl?: string | null },
  ): Promise<UserSummary> {
    const previous = await this.get(id)
    const updated = await this.repository.update(id, patch)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'identity.user.updated',
      outcome: 'success',
      entityType: 'profile',
      entityId: id,
      oldValues: { fullName: previous.fullName, phone: previous.phone },
      newValues: { fullName: updated.fullName, phone: updated.phone },
      sessionId: actor.sessionId,
    })
    return updated
  }

  async updateStatus(
    actor: AuthContext,
    id: string,
    status: AuthProfile['status'],
  ): Promise<UserSummary> {
    const previous = await this.get(id)
    await this.authGateway.setAccountActive(previous.authUserId, status === 'active')
    const updated = await this.repository.updateStatus(id, status)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'identity.user.status_changed',
      outcome: 'success',
      entityType: 'profile',
      entityId: id,
      oldValues: { status: previous.status },
      newValues: { status },
      sessionId: actor.sessionId,
    })
    return updated
  }

  async replaceRoles(actor: AuthContext, id: string, roleIds: string[]): Promise<UserSummary> {
    const previous = await this.get(id)
    const updated = await this.repository.replaceRoles(id, roleIds, actor.profile.id)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'rbac.user_roles.changed',
      outcome: 'success',
      entityType: 'profile',
      entityId: id,
      oldValues: { roleIds: previous.roles.map((role) => role.id) },
      newValues: { roleIds },
      sessionId: actor.sessionId,
    })
    return updated
  }
}
