export interface SystemDiagnostics {
  status: 'operational' | 'degraded' | 'maintenance'
  dbStatus: 'connected' | 'disconnected'
  dbLatencyMs: number
  apiUptimeSeconds: number
  processMemoryUsage: {
    heapUsedMb: number
    heapTotalMb: number
    rssMb: number
  }
  environment: string
  version: string
  timestamp: string
}

export interface AuditLogItem {
  id: string
  actorProfileId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  payload?: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogFilterDto {
  actorProfileId?: string
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface AcademicYearArchive {
  id: string
  academicYearId: string
  archiveName: string
  archivedAt: string
  archivedBy: string
  notes?: string | null
  summaryJson?: Record<string, unknown> | null
  createdAt: string
}

export interface ArchiveAcademicYearDto {
  academicYearId: string
  notes?: string | null
}
