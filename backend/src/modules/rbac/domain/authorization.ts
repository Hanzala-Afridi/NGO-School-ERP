import type { Permission, Role } from '@ngo-school-erp/contracts'

export type RecordScope =
  | { kind: 'all' }
  | { kind: 'self'; targetProfileId: string }
  | { kind: 'unsupported'; resource: string }

export interface RbacRepository {
  listRoles(): Promise<Role[]>
  listPermissions(): Promise<Permission[]>
  createRole(input: { name: string; description: string }): Promise<Role>
  updateRole(id: string, input: { name?: string; description?: string }): Promise<Role>
  replaceRolePermissions(id: string, permissionIds: string[]): Promise<Role>
}
