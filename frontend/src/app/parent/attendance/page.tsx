import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ParentAttendancePage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const identity = await getCurrentIdentity(token)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col animate-fade-up">
      <AppHeader userFullName={identity.profile.fullName} roles={identity.roles.map((r) => r.name)} />

      <main className="flex-1 p-6 md:p-8 mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/parent">
                <ArrowLeft className="size-4 mr-1" /> Portal Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Children&apos;s Attendance History</h1>
              <p className="text-sm text-muted-foreground">Read-only daily attendance record and attendance percentage for linked children.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Verified attendance percentage across school terms.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card/50 backdrop-blur-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Overall Attendance Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold text-emerald-600">96.5%</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Days Present</CardDescription>
                  <CardTitle className="text-2xl font-bold font-bold">110 Days</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Days Absent / Excused</CardDescription>
                  <CardTitle className="text-2xl font-bold text-amber-600">4 Days</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
