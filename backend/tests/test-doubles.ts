import type { AuthContext } from '../src/modules/auth/domain/auth-context.js'
import type {
  AuditRepository,
  SecurityAuditEvent,
} from '../src/modules/audit/application/audit.service.js'

export class MemoryAuditRepository implements AuditRepository {
  readonly events: SecurityAuditEvent[] = []
  write(event: SecurityAuditEvent): Promise<void> {
    this.events.push(event)
    return Promise.resolve()
  }
}

export function createAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    accessToken: 'verified-access-token',
    sessionId: 'session-1',
    profile: {
      id: '00000000-0000-4000-8000-000000000001',
      authUserId: '00000000-0000-4000-8000-000000000002',
      fullName: 'Test Admin',
      email: 'admin@example.invalid',
      phone: null,
      profileImageUrl: null,
      status: 'active',
    },
    roles: [{ id: '00000000-0000-4000-8000-000000000003', name: 'Admin' }],
    permissions: new Set(['users.read']),
    ...overrides,
  }
}
