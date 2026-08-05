import type { AuthProfile, UserSummary } from '@ngo-school-erp/contracts'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { IdentityRepository } from '../domain/profile.js'

type ProfileRow = {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone: string | null
  profile_image_url: string | null
  status: AuthProfile['status']
  user_roles?: Array<{ role: { id: string; name: string } | null }>
}

function mapProfile(row: ProfileRow): UserSummary {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    profileImageUrl: row.profile_image_url,
    status: row.status,
    roles: (row.user_roles ?? [])
      .map((assignment) => assignment.role)
      .filter((role): role is { id: string; name: string } => role !== null),
  }
}

const profileSelect =
  'id,auth_user_id,full_name,email,phone,profile_image_url,status,user_roles!user_roles_user_id_fkey(role:roles(id,name))'

export class SupabaseIdentityRepository implements IdentityRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAuthorizationIdentity(authUserId: string): Promise<UserSummary | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select(profileSelect)
      .eq('auth_user_id', authUserId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapProfile(data as unknown as ProfileRow) : null
  }

  async findById(id: string): Promise<UserSummary | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select(profileSelect)
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapProfile(data as unknown as ProfileRow) : null
  }

  async list(input: {
    page: number
    pageSize: number
    search?: string
  }): Promise<{ items: UserSummary[]; total: number }> {
    const from = (input.page - 1) * input.pageSize
    let query = this.client
      .from('profiles')
      .select(profileSelect, { count: 'exact' })
      .range(from, from + input.pageSize - 1)
      .order('created_at', { ascending: false })
    if (input.search) {
      const escaped = input.search.replaceAll('%', '\\%').replaceAll(',', '')
      query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`)
    }
    const { data, error, count } = await query
    if (error) throw new Error(error.message)
    return {
      items: (data as unknown as ProfileRow[]).map(mapProfile),
      total: count ?? 0,
    }
  }

  async update(
    id: string,
    patch: { fullName?: string; phone?: string | null; profileImageUrl?: string | null },
  ): Promise<UserSummary> {
    const databasePatch = {
      ...(patch.fullName === undefined ? {} : { full_name: patch.fullName }),
      ...(patch.phone === undefined ? {} : { phone: patch.phone }),
      ...(patch.profileImageUrl === undefined ? {} : { profile_image_url: patch.profileImageUrl }),
    }
    const { error } = await this.client.from('profiles').update(databasePatch).eq('id', id)
    if (error) throw new Error(error.message)
    const profile = await this.findById(id)
    if (!profile) throw new Error('Profile not found')
    return profile
  }

  async updateStatus(id: string, status: AuthProfile['status']): Promise<UserSummary> {
    const { error } = await this.client.from('profiles').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    const profile = await this.findById(id)
    if (!profile) throw new Error('Profile not found')
    return profile
  }

  async replaceRoles(id: string, roleIds: string[], actorId: string): Promise<UserSummary> {
    const { error } = await this.client.rpc('replace_user_roles', {
      target_user_id: id,
      replacement_role_ids: roleIds,
      actor_user_id: actorId,
    })
    if (error) throw new Error(error.message)
    const profile = await this.findById(id)
    if (!profile) throw new Error('Profile not found')
    return profile
  }
}
