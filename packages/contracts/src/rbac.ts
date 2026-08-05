export interface Permission {
  id: string
  key: string
  description: string
}

export interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: Permission[]
}
