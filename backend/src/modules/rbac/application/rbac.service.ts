import type { Permission, Role } from '@ngo-school-erp/contracts'

import type { AuditService } from '../../audit/application/audit.service.js'
import type { AuthContext } from '../../auth/domain/auth-context.js'
import type { RbacRepository } from '../domain/authorization.js'

export class RbacService {
  constructor(
    private readonly repository: RbacRepository,
    private readonly audit: AuditService,
  ) {}

  listRoles(): Promise<Role[]> {
    return this.repository.listRoles()
  }

  listPermissions(): Promise<Permission[]> {
    return this.repository.listPermissions()
  }

  async createRole(
    actor: AuthContext,
    input: { name: string; description: string },
  ): Promise<Role> {
    const role = await this.repository.createRole(input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'rbac.role.created',
      outcome: 'success',
      entityType: 'role',
      entityId: role.id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return role
  }

  async updateRole(
    actor: AuthContext,
    id: string,
    input: { name?: string; description?: string },
  ): Promise<Role> {
    const role = await this.repository.updateRole(id, input)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'rbac.role.updated',
      outcome: 'success',
      entityType: 'role',
      entityId: id,
      newValues: input,
      sessionId: actor.sessionId,
    })
    return role
  }

  async replacePermissions(actor: AuthContext, id: string, permissionIds: string[]): Promise<Role> {
    const role = await this.repository.replaceRolePermissions(id, permissionIds)
    await this.audit.record({
      actorProfileId: actor.profile.id,
      action: 'rbac.role_permissions.changed',
      outcome: 'success',
      entityType: 'role',
      entityId: id,
      newValues: { permissionIds },
      sessionId: actor.sessionId,
    })
    return role
  }
}
