import { SupabaseClient } from '@supabase/supabase-js'
import { AuditLogFilterDto, AuditLogItem, SystemDiagnostics } from '@ngo-school-erp/contracts'

export class SupabaseSystemRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getDiagnostics(): Promise<SystemDiagnostics> {
    const startTime = Date.now()
    let dbStatus: 'connected' | 'disconnected' = 'connected'

    try {
      await this.supabase.from('roles').select('id', { head: true, count: 'exact' })
    } catch {
      dbStatus = 'disconnected'
    }

    const dbLatencyMs = Date.now() - startTime
    const mem = process.memoryUsage()

    return {
      status: dbStatus === 'connected' ? 'operational' : 'degraded',
      dbStatus,
      dbLatencyMs,
      apiUptimeSeconds: Math.floor(process.uptime()),
      processMemoryUsage: {
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }
  }

  async listAuditLogs(filter: AuditLogFilterDto): Promise<AuditLogItem[]> {
    let query = this.supabase.from('audit_logs').select('*').order('created_at', { ascending: false })

    if (filter.actorProfileId) query = query.eq('actor_profile_id', filter.actorProfileId)
    if (filter.action) query = query.eq('action', filter.action)
    if (filter.entityType) query = query.eq('entity_type', filter.entityType)
    if (filter.startDate) query = query.gte('created_at', filter.startDate)
    if (filter.endDate) query = query.lte('created_at', filter.endDate)

    const limit = Math.min(filter.limit || 50, 100)
    const page = Math.max(filter.page || 1, 1)
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error || !data) return []

    return data.map((d) => ({
      id: d.id,
      actorProfileId: d.actor_profile_id,
      action: d.action,
      entityType: d.entity_type,
      entityId: d.entity_id,
      payload: d.payload,
      createdAt: d.created_at,
    }))
  }

  async exportAuditLogsCsv(filter: AuditLogFilterDto): Promise<string> {
    const logs = await this.listAuditLogs({ ...filter, limit: 100 })
    if (logs.length === 0) return 'id,action,entityType,createdAt\n'

    const headers = ['id', 'actorProfileId', 'action', 'entityType', 'entityId', 'createdAt']
    const csvRows = logs.map((l) =>
      headers
        .map((h) => {
          let val = String((l as any)[h] ?? '')
          if (['=', '+', '-', '@'].includes(val.charAt(0))) {
            val = `'${val}`
          }
          return `"${val.replace(/"/g, '""')}"`
        })
        .join(',')
    )

    return `${headers.join(',')}\n${csvRows.join('\n')}`
  }
}
