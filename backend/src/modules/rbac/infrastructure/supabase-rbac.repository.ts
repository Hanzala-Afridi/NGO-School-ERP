import type { Permission, Role } from '@ngo-school-erp/contracts'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { RbacRepository } from '../domain/authorization.js'

type RoleRow = {
  id: string
  name: string
  description: string
  is_system: boolean
  role_permissions?: Array<{ permission: Permission | null }>
}

function mapRole(row: RoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.is_system,
    permissions: (row.role_permissions ?? [])
      .map((assignment) => assignment.permission)
      .filter((permission): permission is Permission => permission !== null),
  }
}

const roleSelect =
  'id,name,description,is_system,role_permissions(permission:permissions(id,key,description))'

export class SupabaseRbacRepository implements RbacRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listRoles(): Promise<Role[]> {
    const { data, error } = await this.client.from('roles').select(roleSelect).order('name')
    if (error) throw new Error(error.message)
    return (data as unknown as RoleRow[]).map(mapRole)
  }

  async listPermissions(): Promise<Permission[]> {
    const { data, error } = await this.client
      .from('permissions')
      .select('id,key,description')
      .order('key')
    if (error) throw new Error(error.message)
    return data
  }

  async createRole(input: { name: string; description: string }): Promise<Role> {
    const { data, error } = await this.client
      .from('roles')
      .insert({ ...input, is_system: false })
      .select(roleSelect)
      .single()
    if (error) throw new Error(error.message)
    return mapRole(data as unknown as RoleRow)
  }

  async updateRole(id: string, input: { name?: string; description?: string }): Promise<Role> {
    const { data: existing, error: readError } = await this.client
      .from('roles')
      .select('is_system')
      .eq('id', id)
      .single()
    if (readError) throw new Error(readError.message)
    if (existing.is_system && input.name !== undefined) {
      throw new Error('System role names cannot be changed')
    }
    const { data, error } = await this.client
      .from('roles')
      .update(input)
      .eq('id', id)
      .select(roleSelect)
      .single()
    if (error) throw new Error(error.message)
    return mapRole(data as unknown as RoleRow)
  }

  async replaceRolePermissions(id: string, permissionIds: string[]): Promise<Role> {
    const { error } = await this.client.rpc('replace_role_permissions', {
      target_role_id: id,
      replacement_permission_ids: permissionIds,
    })
    if (error) throw new Error(error.message)
    const roles = await this.listRoles()
    const role = roles.find((candidate) => candidate.id === id)
    if (!role) throw new Error('Role not found')
    return role
  }
}
