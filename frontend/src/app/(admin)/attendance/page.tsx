import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Lock, Plus, UserCheck } from 'lucide-react'

import { lockAttendanceSessionAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAcademicYears, getAttendanceSessions, getClasses, getSections } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ItemRecord {
  id: string
  name?: string
  attendanceDate?: string
  academicYearId?: string
  classId?: string
  sectionId?: string | null
  status?: string
}

export default async function AdminAttendancePage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) redirect('/login')

  const token = sessionData.session.access_token

  const [years, classes, sections, sessions] = await Promise.all([
    getAcademicYears(token).catch(() => []),
    getClasses(token).catch(() => []),
    getSections(token).catch(() => []),
    getAttendanceSessions(token).catch(() => []),
  ])

  const classMap = new Map((classes as unknown as ItemRecord[]).map((c) => [c.id, c.name ?? 'Class']))
  const sectionMap = new Map((sections as unknown as ItemRecord[]).map((s) => [s.id, s.name ?? 'A']))
  const yearMap = new Map((years as unknown as ItemRecord[]).map((y) => [y.id, y.name ?? y.id]))

  const sessionList = sessions as unknown as ItemRecord[]
  const lockedCount = sessionList.filter((s) => s.status === 'locked').length
  const submittedCount = sessionList.filter((s) => s.status === 'submitted').length

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <UserCheck className="size-4" />
            <span>Phase 4 Attendance Module</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Attendance Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Daily class attendance tracking, session locking, and Admin audit oversight.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/attendance/corrections">
              <Clock className="size-4 mr-1.5" />
              Correction Queue
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/attendance/mark">
              <Plus className="size-4 mr-1.5" />
              + Mark Class Attendance
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Sessions</CardDescription>
            <CardTitle className="text-2xl font-bold">{sessionList.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Active / Submitted</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">{submittedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Locked Sessions</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">{lockedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Sessions Log</CardTitle>
          <CardDescription>Comprehensive daily attendance records across classes and sections.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionList.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No Attendance Sessions"
              description="No attendance sessions have been recorded yet. Click 'Mark Class Attendance' to get started."
            />
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionList.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold">{s.attendanceDate}</TableCell>
                      <TableCell>{s.academicYearId ? (yearMap.get(s.academicYearId) ?? s.academicYearId) : ''}</TableCell>
                      <TableCell>
                        <span className="font-medium">{s.classId ? (classMap.get(s.classId) ?? 'Class') : 'Class'}</span>
                        {s.sectionId && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Sec {sectionMap.get(s.sectionId) ?? 'A'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.status === 'locked' ? (
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 font-semibold">
                            <Lock className="size-3 mr-1" /> Locked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold">
                            <CheckCircle2 className="size-3 mr-1" /> Submitted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.status !== 'locked' && (
                          <form action={lockAttendanceSessionAction as unknown as (formData: FormData) => void} className="inline">
                            <input type="hidden" name="id" value={s.id} />
                            <Button size="sm" variant="ghost" className="text-xs text-amber-600 hover:text-amber-700">
                              <Lock className="size-3.5 mr-1" /> Lock Session
                            </Button>
                          </form>
                        )}
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
