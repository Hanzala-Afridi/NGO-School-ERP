export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number | null
}

export interface AuthProfile {
  id: string
  authUserId: string
  fullName: string
  email: string
  phone: string | null
  profileImageUrl: string | null
  status: 'active' | 'inactive'
}

export interface CurrentIdentity {
  profile: AuthProfile
  roles: Array<{ id: string; name: string }>
  permissions: string[]
}
