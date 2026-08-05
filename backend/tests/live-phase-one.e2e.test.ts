import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, describe, expect, it } from 'vitest'

const runLiveTests = process.env.LIVE_SUPABASE_E2E === 'true'
const apiBaseUrl = process.env.LIVE_BACKEND_URL ?? 'http://localhost:4000/api/v1'
const runId = `phase-one-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
const userAgent = `ngo-school-erp-e2e/${runId}`

interface ApiResult<T> {
  status: number
  body: {
    success: boolean
    data?: T
    error?: { code: string }
  }
}

interface CreatedIdentity {
  authUserId: string
  profileId: string
  email: string
  password: string
}

const createdAuthUserIds: string[] = []
let createdCustomRoleId: string | undefined
let adminClient: SupabaseClient | undefined

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required for live Phase One validation`)
  return value
}

function publicClient() {
  return createClient(
    requiredEnvironment('LIVE_SUPABASE_URL'),
    requiredEnvironment('LIVE_SUPABASE_PUBLISHABLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  )
}

async function api<T>(
  path: string,
  options: {
    method?: string
    token?: string
    body?: unknown
  } = {},
): Promise<ApiResult<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      'user-agent': userAgent,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  return {
    status: response.status,
    body: (await response.json()) as ApiResult<T>['body'],
  }
}

async function createIdentity(label: string): Promise<CreatedIdentity> {
  const client = adminClient!
  const email = `${runId}-${label}@example.invalid`
  const password = `Synthetic-${crypto.randomUUID()}!`
  const result = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Synthetic ${label}` },
  })
  if (result.error || !result.data.user) {
    throw new Error(`Unable to create ${label} identity: ${result.error?.message}`)
  }
  createdAuthUserIds.push(result.data.user.id)
  const profileResult = await client
    .from('profiles')
    .select('id')
    .eq('auth_user_id', result.data.user.id)
    .single()
  if (profileResult.error) {
    throw new Error(`Unable to load ${label} profile: ${profileResult.error.message}`)
  }
  return {
    authUserId: result.data.user.id,
    profileId: profileResult.data.id as string,
    email,
    password,
  }
}

async function assignRole(identity: CreatedIdentity, roleId: string): Promise<void> {
  const result = await adminClient!.from('user_roles').insert({
    user_id: identity.profileId,
    role_id: roleId,
  })
  if (result.error) throw new Error(`Unable to assign synthetic role: ${result.error.message}`)
}

async function login(identity: CreatedIdentity): Promise<Session> {
  const result = await api<{
    accessToken: string
    refreshToken: string
    expiresAt: number
  }>('/auth/login', {
    method: 'POST',
    body: { email: identity.email, password: identity.password },
  })
  expect(result.status).toBe(200)
  expect(result.body.success).toBe(true)
  return {
    access_token: result.body.data!.accessToken,
    refresh_token: result.body.data!.refreshToken,
    expires_at: result.body.data!.expiresAt,
    expires_in: 3600,
    token_type: 'bearer',
    user: {} as Session['user'],
  }
}

async function cleanup(): Promise<void> {
  if (!adminClient) return
  const cleanupErrors: string[] = []
  for (const authUserId of createdAuthUserIds) {
    const result = await adminClient.auth.admin.deleteUser(authUserId)
    if (result.error) cleanupErrors.push(`identity ${authUserId}: ${result.error.message}`)
  }
  if (createdCustomRoleId) {
    const result = await adminClient.from('roles').delete().eq('id', createdCustomRoleId)
    if (result.error) cleanupErrors.push(`role ${createdCustomRoleId}: ${result.error.message}`)
  }
  if (cleanupErrors.length > 0) {
    throw new Error(`Synthetic cleanup failed: ${cleanupErrors.join('; ')}`)
  }
}

describe.skipIf(!runLiveTests)('live Phase One authentication and RBAC', () => {
  afterAll(async () => {
    await cleanup()
  })

  it('validates invite-only authentication, authorization, recovery, and revocation', async () => {
    adminClient = createClient(
      requiredEnvironment('LIVE_SUPABASE_URL'),
      requiredEnvironment('LIVE_SUPABASE_SECRET_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    )

    const signup = await publicClient().auth.signUp({
      email: `${runId}-signup@example.invalid`,
      password: `Synthetic-${crypto.randomUUID()}!`,
    })
    expect(signup.error).not.toBeNull()

    const rolesResult = await adminClient.from('roles').select('id,name').eq('is_system', true)
    if (rolesResult.error) throw rolesResult.error
    const roleIds = new Map(
      rolesResult.data.map((role) => [role.name as string, role.id as string]),
    )
    expect([...roleIds.keys()].sort()).toEqual(['Admin', 'Parent', 'Teacher'])

    const permissionsResult = await adminClient.from('permissions').select('id,key')
    if (permissionsResult.error) throw permissionsResult.error
    const permissionIds = new Map(
      permissionsResult.data.map((permission) => [
        permission.key as string,
        permission.id as string,
      ]),
    )
    expect(permissionIds.size).toBe(11)

    const customRoleResult = await adminClient
      .from('roles')
      .insert({
        name: `Scoped Reader ${runId}`,
        description: 'Synthetic record-scope validation role',
      })
      .select('id')
      .single()
    if (customRoleResult.error) throw customRoleResult.error
    createdCustomRoleId = customRoleResult.data.id as string
    const customPermissionResult = await adminClient.from('role_permissions').insert([
      {
        role_id: createdCustomRoleId,
        permission_id: permissionIds.get('profiles.read_self')!,
      },
      {
        role_id: createdCustomRoleId,
        permission_id: permissionIds.get('users.read')!,
      },
    ])
    if (customPermissionResult.error) throw customPermissionResult.error

    const admin = await createIdentity('Admin')
    const teacher = await createIdentity('Teacher')
    const parent = await createIdentity('Parent')
    const scopedReader = await createIdentity('ScopedReader')
    const unassigned = await createIdentity('Unassigned')
    const inactive = await createIdentity('Inactive')

    await assignRole(admin, roleIds.get('Admin')!)
    await assignRole(teacher, roleIds.get('Teacher')!)
    await assignRole(parent, roleIds.get('Parent')!)
    await assignRole(scopedReader, createdCustomRoleId)
    await assignRole(inactive, roleIds.get('Teacher')!)
    const inactiveResult = await adminClient
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', inactive.profileId)
    if (inactiveResult.error) throw inactiveResult.error

    expect((await api('/auth/me', { token: 'not-a-jwt' })).status).toBe(401)
    expect(
      (
        await api('/auth/login', {
          method: 'POST',
          body: { email: unassigned.email, password: unassigned.password },
        })
      ).status,
    ).toBe(401)
    expect(
      (
        await api('/auth/login', {
          method: 'POST',
          body: { email: inactive.email, password: inactive.password },
        })
      ).status,
    ).toBe(401)

    const adminSession = await login(admin)
    const teacherSession = await login(teacher)
    const parentSession = await login(parent)
    const scopedReaderSession = await login(scopedReader)

    const adminMe = await api<{
      roles: Array<{ name: string }>
      profile: { id: string }
      permissions: string[]
    }>('/auth/me', { token: adminSession.access_token })
    expect(adminMe.status).toBe(200)
    expect(adminMe.body.data?.profile.id).toBe(admin.profileId)
    expect(adminMe.body.data?.roles.map((role) => role.name)).toContain('Admin')
    expect(adminMe.body.data?.permissions).toHaveLength(11)

    for (const [identity, session, role] of [
      [teacher, teacherSession, 'Teacher'],
      [parent, parentSession, 'Parent'],
    ] as const) {
      const me = await api<{ profile: { id: string }; roles: Array<{ name: string }> }>(
        '/auth/me',
        { token: session.access_token },
      )
      expect(me.status).toBe(200)
      expect(me.body.data?.profile.id).toBe(identity.profileId)
      expect(me.body.data?.roles.map((item) => item.name)).toContain(role)
      const permissions = await api<string[]>('/auth/permissions', {
        token: session.access_token,
      })
      expect(permissions.status).toBe(200)
      expect(permissions.body.data).toEqual(['profiles.read_self'])
    }

    expect((await api('/users', { token: adminSession.access_token })).status).toBe(200)
    expect((await api('/users', { token: teacherSession.access_token })).status).toBe(403)
    expect((await api('/users', { token: parentSession.access_token })).status).toBe(403)
    const scopeDenial = await api('/users', { token: scopedReaderSession.access_token })
    expect(scopeDenial.status).toBe(403)
    expect(scopeDenial.body.error?.code).toBe('RECORD_SCOPE_DENIED')

    const roleReplacement = await api(`/users/${parent.profileId}/roles`, {
      method: 'POST',
      token: adminSession.access_token,
      body: { roleIds: [roleIds.get('Parent')!] },
    })
    expect(roleReplacement.status).toBe(200)

    const refreshed = await publicClient().auth.refreshSession({
      refresh_token: teacherSession.refresh_token,
    })
    expect(refreshed.error).toBeNull()
    expect(refreshed.data.session).not.toBeNull()
    expect(
      (
        await api('/auth/me', {
          token: refreshed.data.session!.access_token,
        })
      ).status,
    ).toBe(200)

    const recoveryResponse = await api('/auth/password-recovery', {
      method: 'POST',
      body: { email: admin.email },
    })
    expect(recoveryResponse.status).toBe(200)

    const recoveryLink = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: admin.email,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password',
      },
    })
    if (recoveryLink.error) throw recoveryLink.error
    const recoverySession = await publicClient().auth.verifyOtp({
      type: 'recovery',
      token_hash: recoveryLink.data.properties.hashed_token,
    })
    expect(recoverySession.error).toBeNull()
    expect(recoverySession.data.session).not.toBeNull()

    const changedPassword = `Changed-${crypto.randomUUID()}!`
    const passwordUpdate = await api('/auth/password', {
      method: 'PATCH',
      token: recoverySession.data.session!.access_token,
      body: { newPassword: changedPassword },
    })
    expect(passwordUpdate.status).toBe(200)
    admin.password = changedPassword
    const changedLoginSession = await login(admin)

    const logoutResult = await api('/auth/logout', {
      method: 'POST',
      token: changedLoginSession.access_token,
    })
    expect(logoutResult.status).toBe(200)
    expect((await api('/auth/me', { token: changedLoginSession.access_token })).status).toBe(401)
    const revokedRefresh = await publicClient().auth.refreshSession({
      refresh_token: changedLoginSession.refresh_token,
    })
    expect(revokedRefresh.error).not.toBeNull()

    const auditResult = await adminClient
      .from('audit_logs')
      .select('action,actor_profile_id,session_id,old_values_json,new_values_json')
      .eq('user_agent', userAgent)
    if (auditResult.error) throw auditResult.error
    const actions = new Set(auditResult.data.map((event) => event.action as string))
    for (const expectedAction of [
      'auth.login',
      'auth.session.accepted',
      'auth.token.rejected',
      'auth.password_recovery.requested',
      'auth.password.updated',
      'auth.logout',
      'authorization.permission.denied',
      'authorization.scope.denied',
    ]) {
      expect(actions).toContain(expectedAction)
    }
    const roleAuditResult = await adminClient
      .from('audit_logs')
      .select('id')
      .eq('action', 'rbac.user_roles.changed')
      .eq('entity_id', parent.profileId)
    if (roleAuditResult.error) throw roleAuditResult.error
    expect(roleAuditResult.data).toHaveLength(1)
    const acceptedSessionIds = auditResult.data
      .filter((event) => event.action === 'auth.session.accepted')
      .map((event) => event.session_id as string)
    expect(new Set(acceptedSessionIds).size).toBe(acceptedSessionIds.length)
    const serializedAudit = JSON.stringify(auditResult.data)
    for (const sensitiveValue of [
      admin.password,
      teacher.password,
      parent.password,
      scopedReader.password,
      adminSession.access_token,
      adminSession.refresh_token,
      changedLoginSession.access_token,
      changedLoginSession.refresh_token,
    ]) {
      expect(serializedAudit).not.toContain(sensitiveValue)
    }
  }, 120_000)
})
