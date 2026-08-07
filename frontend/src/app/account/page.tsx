import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  Layers,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

import { LogoutButton } from '@/components/auth/logout-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
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

  const isAdmin = identity.roles.some((role) => role.name === 'Admin')
  const isTeacher = identity.roles.some((role) => role.name === 'Teacher')
  const isParent = identity.roles.some((role) => role.name === 'Parent')

  // Group permission strings into human-readable module categories
  const permissionSet = new Set(identity.permissions)
  const studentPerms = ['students.create', 'students.read', 'students.update', 'students.archive'].filter((p) => permissionSet.has(p))
  const academicPerms = ['schools.read', 'academic_years.create', 'classes.create', 'sections.create', 'subjects.create', 'teacher_assignments.create', 'timetable.create'].filter((p) => permissionSet.has(p))
  const enrollmentPerms = ['enrollments.create', 'enrollments.read', 'enrollments.promote', 'enrollments.transfer', 'enrollments.withdraw'].filter((p) => permissionSet.has(p))

  return (
    <main className="min-h-screen bg-muted/30 p-6 sm:p-10 animate-fade-up">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" />
              <span>Authenticated Account Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{identity.profile.fullName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{identity.profile.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button asChild className="font-semibold shadow-xs">
                <Link href="/admin">Admin Dashboard →</Link>
              </Button>
            )}
            {isTeacher && !isAdmin && (
              <Button asChild className="font-semibold shadow-xs">
                <Link href="/teacher">Teacher Portal →</Link>
              </Button>
            )}
            {isParent && !isAdmin && !isTeacher && (
              <Button asChild className="font-semibold shadow-xs">
                <Link href="/parent">Parent Portal →</Link>
              </Button>
            )}
            <LogoutButton />
          </div>
        </header>

        {/* Dedicated Portal Shortcuts Banner */}
        <div className="flex flex-wrap gap-4">
          {isAdmin && (
            <Card className="flex-1 min-w-[240px] border-l-4 border-l-primary p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Admin Dashboard</h4>
                  <p className="text-xs text-muted-foreground">Full system administration</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/admin">Open →</Link>
              </Button>
            </Card>
          )}

          {isTeacher && (
            <Card className="flex-1 min-w-[240px] border-l-4 border-l-emerald-600 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Teacher Portal</h4>
                  <p className="text-xs text-muted-foreground">Classes & timetable</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/teacher">Open →</Link>
              </Button>
            </Card>
          )}

          {isParent && (
            <Card className="flex-1 min-w-[240px] border-l-4 border-l-amber-500 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <HeartHandshake className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Parent Portal</h4>
                  <p className="text-xs text-muted-foreground">Linked children profiles</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/parent">Open →</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Profile & Role Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">User Profile Information</CardTitle>
              <CardDescription>Personal details and account activation state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Full Name</span>
                  <span className="font-semibold text-foreground">{identity.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Account Status</span>
                  <Badge variant={identity.profile.status === 'active' ? 'default' : 'secondary'} className="mt-0.5 capitalize">
                    {identity.profile.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Email Address</span>
                  <span className="font-mono text-xs font-medium text-foreground">{identity.profile.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Assigned System Roles</CardTitle>
              <CardDescription>Configured role access scope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {identity.roles.map((role) => (
                  <Badge key={role.id} className="px-3 py-1 bg-primary text-primary-foreground font-semibold">
                    {role.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t leading-relaxed">
                {isAdmin && 'Full operational administration access across all school modules.'}
                {isTeacher && 'Teacher access restricted to assigned classes, subjects, and timetable.'}
                {isParent && 'Parent access restricted to linked children details.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Readable Permission Breakdown Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Granted Authorization Permissions</CardTitle>
            <CardDescription>Backend-enforced permission key capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Student Perms */}
              <div className="rounded-lg border p-4 bg-card space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <GraduationCap className="size-4 text-primary" />
                  <span>Students & People</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {studentPerms.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {studentPerms.map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-foreground font-medium">
                          <CheckCircle2 className="size-3 text-primary" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="italic">No direct student permissions</span>
                  )}
                </div>
              </div>

              {/* Academic Perms */}
              <div className="rounded-lg border p-4 bg-card space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <BookOpen className="size-4 text-primary" />
                  <span>Academic Setup</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {academicPerms.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {academicPerms.map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-foreground font-medium">
                          <CheckCircle2 className="size-3 text-primary" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="italic">No direct academic permissions</span>
                  )}
                </div>
              </div>

              {/* Enrollment Perms */}
              <div className="rounded-lg border p-4 bg-card space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <Layers className="size-4 text-primary" />
                  <span>Enrollment Lifecycle</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {enrollmentPerms.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {enrollmentPerms.map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-foreground font-medium">
                          <CheckCircle2 className="size-3 text-primary" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="italic">No direct enrollment permissions</span>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Advanced Raw Permission Keys Section */}
            <details className="group border-t pt-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-xs text-muted-foreground hover:text-foreground">
                <span>View Raw Technical Permission Keys ({identity.permissions.length} total)</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                {identity.permissions.map((permission) => (
                  <li key={permission} className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground border">
                    {permission}
                  </li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
