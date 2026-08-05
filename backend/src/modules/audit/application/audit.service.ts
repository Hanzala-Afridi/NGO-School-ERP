export interface SecurityAuditEvent {
  actorProfileId?: string | null
  action: string
  outcome: 'success' | 'failure' | 'denied'
  reasonCode?: string | null
  entityType?: string | null
  entityId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  requestId?: string | null
  sessionId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuditRepository {
  write(event: SecurityAuditEvent): Promise<void>
}

export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  async record(event: SecurityAuditEvent): Promise<void> {
    await this.repository.write(event)
  }
}
