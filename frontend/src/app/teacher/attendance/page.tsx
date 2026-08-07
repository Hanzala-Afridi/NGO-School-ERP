import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'

import MarkAttendanceSheet from '@/app/(admin)/attendance/mark/page'
import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TeacherAttendancePage() {
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

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col animate-fade-up">
      <AppHeader userFullName={identity.profile.fullName} roles={identity.roles.map((r) => r.name)} />

      <main className="flex-1 p-6 md:p-8 mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher">
                <ArrowLeft className="size-4 mr-1" /> Portal Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Classroom Attendance Marking</h1>
              <p className="text-sm text-muted-foreground">Mark daily attendance for your assigned class sections.</p>
            </div>
          </div>
        </div>

        <MarkAttendanceSheet />
      </main>
    </div>
  )
}
