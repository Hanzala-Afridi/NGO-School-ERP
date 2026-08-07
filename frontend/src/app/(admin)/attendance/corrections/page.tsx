import { redirect } from 'next/navigation'
import { Check, Clock, X } from 'lucide-react'

import { reviewAttendanceCorrectionAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getPendingCorrections } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface CorrectionRecord {
  id: string
  createdAt: string
  oldStatus: string
  requestedStatus: string
  reason: string
}

export default async function AttendanceCorrectionsQueuePage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const corrections = (await getPendingCorrections(token).catch(() => [])) as unknown as CorrectionRecord[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Clock className="size-4" />
            <span>Attendance Audit & Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Correction Request Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review teacher correction requests for locked attendance sessions with audit logging.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Correction Requests</CardTitle>
          <CardDescription>Approve or reject teacher modification justifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {corrections.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Pending Correction Requests"
              description="All locked attendance session correction requests have been reviewed."
            />
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Old Status</TableHead>
                    <TableHead>Requested Status</TableHead>
                    <TableHead>Justification Reason</TableHead>
                    <TableHead className="text-right">Admin Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corrections.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">{c.createdAt ? String(c.createdAt).slice(0, 10) : ''}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase font-mono text-xs">
                          {c.oldStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-mono text-xs">
                          {c.requestedStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{c.reason}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <form action={reviewAttendanceCorrectionAction as unknown as (formData: FormData) => void} className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value="approved" />
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                            <Check className="size-3.5 mr-1" /> Approve
                          </Button>
                        </form>
                        <form action={reviewAttendanceCorrectionAction as unknown as (formData: FormData) => void} className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            <X className="size-3.5 mr-1" /> Reject
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
