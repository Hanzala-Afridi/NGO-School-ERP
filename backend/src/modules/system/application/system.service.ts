import { AuditLogFilterDto, AuditLogItem, SystemDiagnostics } from '@ngo-school-erp/contracts'
import { SupabaseSystemRepository } from '../infrastructure/supabase-system.repository.js'

export class SystemService {
  constructor(private readonly repository: SupabaseSystemRepository) {}

  getDiagnostics(): Promise<SystemDiagnostics> {
    return this.repository.getDiagnostics()
  }

  listAuditLogs(filter: AuditLogFilterDto): Promise<AuditLogItem[]> {
    return this.repository.listAuditLogs(filter)
  }

  exportAuditLogsCsv(filter: AuditLogFilterDto): Promise<string> {
    return this.repository.exportAuditLogsCsv(filter)
  }
}
