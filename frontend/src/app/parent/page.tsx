import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, HeartHandshake, Users } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { getCurrentIdentity, getParents } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ParentPortalPage() {
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

  const isParent = identity.roles.some((role) => role.name === 'Parent' || role.name === 'Admin')
  if (!isParent) redirect('/account')

  const token = sessionData.session.access_token

  // Fetch parent record using authorized endpoint
  const parentsList = await getParents(token).catch(() => [])

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col animate-fade-up">
      <AppHeader userFullName={identity.profile.fullName} roles={identity.roles.map((r) => r.name)} />

      <main className="flex-1 p-6 md:p-8 mx-auto w-full max-w-5xl space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <HeartHandshake className="size-4" />
              <span>Parent & Guardian Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome, {identity.profile.fullName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View your linked children&apos;s academic profile and school enrollment status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-semibold text-sm">
              Portal Access Active
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/account">Account Settings</Link>
            </Button>
          </div>
        </div>

        {/* Linked Children Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              <span>Registered Parent Profiles ({parentsList.length})</span>
            </h2>
          </div>

          {parentsList.length === 0 ? (
            <Card className="shadow-xs">
              <CardContent className="p-6">
                <EmptyState
                  icon={Users}
                  title="No Linked Parent Records Found"
                  description="Your parent account is active, but no student records are currently linked to your profile. Please contact the school administration office to establish your family link."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parentsList.map((parent) => (
                <Card key={parent.id} className="border-l-4 border-l-primary shadow-xs transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize text-xs font-semibold">
                        Parent Profile
                      </Badge>
                      <Badge variant={parent.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                        {parent.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold pt-2">{parent.fullName}</CardTitle>
                    <CardDescription>{parent.email ?? 'No email provided'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="rounded-lg bg-muted/60 p-3.5 text-xs space-y-2 border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Contact Phone:</span>
                        <span className="font-mono font-medium text-foreground">{parent.phone ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-muted-foreground">Residential Address:</span>
                        <span className="font-medium text-foreground">{parent.address ?? 'On record'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
