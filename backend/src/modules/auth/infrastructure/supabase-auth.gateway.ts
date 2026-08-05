import type { AuthSession } from '@ngo-school-erp/contracts'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export interface VerifiedToken {
  user: User
  sessionId: string | null
}

export class SupabaseAuthGateway {
  constructor(
    private readonly publicClient: SupabaseClient,
    private readonly adminClient: SupabaseClient,
  ) {}

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.publicClient.auth.signInWithPassword({ email, password })
    if (error || !data.session) throw new Error('INVALID_CREDENTIALS')
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? null,
    }
  }

  async verify(accessToken: string): Promise<VerifiedToken> {
    const { data, error } = await this.publicClient.auth.getUser(accessToken)
    if (error || !data.user) throw new Error('INVALID_ACCESS_TOKEN')
    const claimsResult = await this.publicClient.auth.getClaims(accessToken)
    const sessionId =
      typeof claimsResult.data?.claims.session_id === 'string'
        ? claimsResult.data.claims.session_id
        : null
    if (!sessionId) throw new Error('INVALID_ACCESS_TOKEN')
    const sessionResult = await this.adminClient.rpc('is_auth_session_active', {
      target_session_id: sessionId,
      target_user_id: data.user.id,
    })
    const sessionIsActive: unknown = sessionResult.data
    if (sessionResult.error || sessionIsActive !== true) throw new Error('REVOKED_ACCESS_TOKEN')
    return { user: data.user, sessionId }
  }

  async requestPasswordRecovery(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.publicClient.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw new Error('PASSWORD_RECOVERY_FAILED')
  }

  async updatePassword(authUserId: string, password: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.updateUserById(authUserId, { password })
    if (error) throw new Error('PASSWORD_UPDATE_FAILED')
  }

  async logout(accessToken: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.signOut(accessToken, 'local')
    if (error) throw new Error('LOGOUT_FAILED')
  }

  async inviteUser(email: string, fullName: string, redirectTo: string): Promise<User> {
    const { data, error } = await this.adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo,
    })
    if (error || !data.user) throw new Error(error?.message ?? 'USER_INVITE_FAILED')
    return data.user
  }

  async createConfirmedUser(email: string, password: string, fullName: string): Promise<User> {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error || !data.user) throw new Error(error?.message ?? 'USER_CREATE_FAILED')
    return data.user
  }

  async setAccountActive(authUserId: string, active: boolean): Promise<void> {
    const { error } = await this.adminClient.auth.admin.updateUserById(authUserId, {
      ban_duration: active ? 'none' : '876000h',
    })
    if (error) throw new Error(error.message)
  }
}
