import type { AuthProfile } from '@ngo-school-erp/contracts'

export interface AuthContext {
  accessToken: string
  sessionId: string | null
  profile: AuthProfile
  roles: Array<{ id: string; name: string }>
  permissions: Set<string>
}
