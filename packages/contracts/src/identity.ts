import type { AuthProfile } from './auth.js'

export interface UserSummary extends AuthProfile {
  roles: Array<{ id: string; name: string }>
}

export interface PaginatedUsers {
  items: UserSummary[]
  page: number
  pageSize: number
  total: number
}
