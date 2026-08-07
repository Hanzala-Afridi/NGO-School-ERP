import { redirect } from 'next/navigation'
import { BookOpen, Clock, UserCheck } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentIdentity, getTeacherAssignments, getTeachers, getTimetableEntries } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherPortalPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  let identity
  try {
    identity = await getCurrentIdentity(sessionData.session.access_token)
  } catch {
    await supabase.auth.signOut({ scope: 'local' })
    redirect('/login')
  }

  const isTeacher = identity.roles.some((role) => role.name === 'Teacher' || role.name === 'Admin')
  if (!isTeacher) redirect('/account')

  const token = sessionData.session.access_token

  // Fetch teacher domain record & assignments using authorized endpoints
  const [teachersList, assignments, timetable] = await Promise.all([
    getTeachers(token).catch(() => []),
    getTeacherAssignments(token).catch(() => []),
    getTimetableEntries(token).catch(() => []),
  ])

  // Locate current teacher domain record matching profileId
  const myTeacherRecord = teachersList.find((t) => t.profileId === identity.profile.id)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col animate-fade-up">
      <AppHeader userFullName={identity.profile.fullName} roles={identity.roles.map((r) => r.name)} />

      <main className="flex-1 p-6 md:p-8 mx-auto w-full max-w-6xl space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <UserCheck className="size-4" />
              <span>Faculty Member Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome, {identity.profile.fullName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Access your assigned classes, subject curriculum, and weekly teaching timetable.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {myTeacherRecord?.employeeNumber && (
              <Badge variant="outline" className="px-3 py-1 font-mono text-xs font-semibold bg-primary/10 border-primary/20 text-primary">
                EMP #: {myTeacherRecord.employeeNumber}
              </Badge>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/account">Account Settings</Link>
            </Button>
          </div>
        </div>

        {/* Assigned Classes Grid */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <span>My Assigned Academic Classes & Subjects</span>
            </CardTitle>
            <CardDescription>Class sections and subjects assigned for the active term</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Academic Assignments"
                description="You do not have any class or subject assignments configured for the active academic term yet."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Role Assignment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asgn) => (
                    <TableRow key={asgn.id}>
                      <TableCell className="font-semibold text-foreground">{asgn.classId}</TableCell>
                      <TableCell>{asgn.sectionId ?? 'All Sections'}</TableCell>
                      <TableCell>{asgn.subjectId ?? 'Class Teacher'}</TableCell>
                      <TableCell>
                        {asgn.isClassTeacher ? (
                          <Badge variant="default" className="bg-emerald-600 font-semibold">Class Teacher</Badge>
                        ) : (
                          <Badge variant="secondary">Subject Teacher</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={asgn.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {asgn.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Timetable Schedule Grid */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              <span>Teaching Timetable Schedule</span>
            </CardTitle>
            <CardDescription>Configured period slots and classroom allocations</CardDescription>
          </CardHeader>
          <CardContent>
            {timetable.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Timetable Slots Scheduled"
                description="There are no period slots scheduled for your assigned classes in the timetable foundation."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Weekday</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Room Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timetable.map((tt) => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    return (
                      <TableRow key={tt.id}>
                        <TableCell className="font-semibold">{days[tt.weekday] ?? `Day ${tt.weekday}`}</TableCell>
                        <TableCell className="font-mono text-xs font-medium">{tt.startTime} - {tt.endTime}</TableCell>
                        <TableCell>{tt.classId}</TableCell>
                        <TableCell>{tt.subjectId}</TableCell>
                        <TableCell>{tt.room ?? 'Main Campus'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
