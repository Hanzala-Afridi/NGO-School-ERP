import type { SupabaseClient } from '@supabase/supabase-js'

import type { AuditRepository, SecurityAuditEvent } from '../application/audit.service.js'

export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly client: SupabaseClient) {}

  async write(event: SecurityAuditEvent): Promise<void> {
    const payload = {
      actor_profile_id: event.actorProfileId ?? null,
      action: event.action,
      outcome: event.outcome,
      reason_code: event.reasonCode ?? null,
      entity_type: event.entityType ?? null,
      entity_id: event.entityId ?? null,
      old_values_json: event.oldValues ?? null,
      new_values_json: event.newValues ?? null,
      request_id: event.requestId ?? null,
      session_id: event.sessionId ?? null,
      ip_address: event.ipAddress ?? null,
      user_agent: event.userAgent ?? null,
    }
    const { error } = await this.client.from('audit_logs').upsert(payload, {
      onConflict: 'action,session_id',
      ignoreDuplicates: event.action === 'auth.session.accepted',
    })
    if (error) {
      throw new Error(`Security audit write failed: ${error.message}`)
    }
  }
}
