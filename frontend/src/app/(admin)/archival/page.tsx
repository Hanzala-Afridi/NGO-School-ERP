import { Archive, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAcademicYearArchives } from '@/lib/backend-api'

interface ArchiveRecord {
  id: string
  academicYearId: string
  archiveName: string
  notes?: string | null
  archivedAt: string
  summaryJson?: Record<string, unknown> | null
}

export default async function AdminArchivalPage() {
  let archives: ArchiveRecord[] = []
  let errorMsg: string | null = null

  try {
    const raw = await getAcademicYearArchives('')
    archives = raw as unknown as ArchiveRecord[]
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Failed to load historical archives'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historical Academic Year Freeze & Data Archival</h1>
        <p className="text-muted-foreground">Manage multi-year academic data retention, freeze completed school years, and preserve historical relational integrity.</p>
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
            <CardTitle className="text-sm font-medium">Archived Years</CardTitle>
            <Archive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archives.length}</div>
            <p className="text-xs text-muted-foreground">Frozen historical academic years</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Archival Protection</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Read-Only</div>
            <p className="text-xs text-muted-foreground">Preserved relational integrity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Year Guard</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enforced</div>
            <p className="text-xs text-muted-foreground">Active year cannot be archived</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Academic Archives</CardTitle>
          <CardDescription>Frozen academic year summary snapshots and archival audit trail.</CardDescription>
        </CardHeader>
        <CardContent>
          {archives.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Archive className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No historical academic years archived.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archives.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{a.archiveName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Archived: {new Date(a.archivedAt).toLocaleDateString()} {a.notes ? `| Notes: ${a.notes}` : ''}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Archived
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
