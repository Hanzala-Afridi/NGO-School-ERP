export interface SystemDiagnosticsEntity {
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
