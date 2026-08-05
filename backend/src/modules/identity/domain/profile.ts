import type { AuthProfile, UserSummary } from '@ngo-school-erp/contracts'

export interface IdentityRepository {
  findAuthorizationIdentity(authUserId: string): Promise<UserSummary | null>
  findById(id: string): Promise<UserSummary | null>
  list(input: { page: number; pageSize: number; search?: string }): Promise<{
    items: UserSummary[]
    total: number
  }>
  update(
    id: string,
    patch: { fullName?: string; phone?: string | null; profileImageUrl?: string | null },
  ): Promise<UserSummary>
  updateStatus(id: string, status: AuthProfile['status']): Promise<UserSummary>
  replaceRoles(id: string, roleIds: string[], actorId: string): Promise<UserSummary>
}
