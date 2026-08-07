import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, GraduationCap, Sparkles } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { getCurrentIdentity, getProgressCategories } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ProgressCategoryRecord {
  id: string
  name: string
  description?: string | null
}

export default async function ParentProgressPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const identity = await getCurrentIdentity(token)
  const categories = (await getProgressCategories(token).catch(() => [])) as unknown as ProgressCategoryRecord[]

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
              <h1 className="text-2xl font-extrabold tracking-tight">Child Early-Grade Progress</h1>
              <p className="text-sm text-muted-foreground">Published evaluation remarks and developmental indicators.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Categories</CardTitle>
            <CardDescription>Targeted learning indicators assessed by teachers.</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No Published Evaluation Remarks"
                description="There are currently no published progress entries for your linked children."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <Card key={c.id} className="bg-card/50 backdrop-blur-xs">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{c.description ? String(c.description) : 'General progress indicator.'}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
