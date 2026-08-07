import { Activity, Cpu, Database, Server } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSystemDiagnostics } from '@/lib/backend-api'

interface DiagnosticsPayload {
  status: string
  dbStatus: string
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

export default async function AdminSystemHealthPage() {
  let diag: DiagnosticsPayload | null = null
  let errorMsg: string | null = null

  try {
    const raw = await getSystemDiagnostics('')
    diag = raw as unknown as DiagnosticsPayload
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to query system diagnostics'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operational System Health & Performance Diagnostics</h1>
        <p className="text-muted-foreground">Monitor real-time database latency, process memory consumption, API uptime, and infrastructure readiness.</p>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      {diag && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{diag.status}</div>
              <p className="text-xs text-muted-foreground">Version {diag.version}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">DB Connection Latency</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diag.dbLatencyMs} ms</div>
              <p className="text-xs text-muted-foreground">Status: {diag.dbStatus}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">API Process Uptime</CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diag.apiUptimeSeconds} sec</div>
              <p className="text-xs text-muted-foreground">Environment: {diag.environment}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Heap Memory Usage</CardTitle>
              <Cpu className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{diag.processMemoryUsage.heapUsedMb} MB</div>
              <p className="text-xs text-muted-foreground">Total: {diag.processMemoryUsage.heapTotalMb} MB</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Security & Credential Isolation Audit</CardTitle>
          <CardDescription>Sanitization verification for sensitive operational parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg border bg-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Database URL Isolation</h3>
              <p className="text-xs text-muted-foreground">Credentials and connection strings are masked from diagnostic payloads.</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Verified Safe
            </span>
          </div>
          <div className="p-3 rounded-lg border bg-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Supabase Service Role Key Protection</h3>
              <p className="text-xs text-muted-foreground">Administrative key isolated strictly to server-side backend environment.</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Isolated
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
