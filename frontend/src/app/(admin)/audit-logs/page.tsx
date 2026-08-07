import { Activity, Download, Filter, ShieldCheck, User } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs } from '@/lib/backend-api'

interface AuditRecord {
  id: string
  actorProfileId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  createdAt: string
}

export default async function AdminAuditLogsPage() {
  let logs: AuditRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getAuditLogs('')
    logs = raw as unknown as AuditRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load system audit logs'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Security & Compliance Audit Trail</h1>
          <p className="text-muted-foreground">Immutable operational event log, security tracing, and compliance export center.</p>
        </div>
      </div>

      {errorMsg && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recorded Events</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Total logged audit actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Posture</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Immutable</div>
            <p className="text-xs text-muted-foreground">Append-only audit trail</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Export Compliance</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV Safe</div>
            <p className="text-xs text-muted-foreground">Formula injection protected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Audit Event Roster</CardTitle>
              <CardDescription>Filterable compliance event register.</CardDescription>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md border bg-background flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No security audit events recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div key={l.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{l.action}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-muted text-muted-foreground">
                        {l.entityType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Actor: {l.actorProfileId || 'System'}</span>
                      <span>| Time: {new Date(l.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Logged
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
