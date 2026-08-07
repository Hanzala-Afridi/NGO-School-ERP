import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAnnouncements, getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface AnnouncementRecord {
  id: string
  title: string
  body: string
  priority: string
  publishAt?: string | null
}

export default async function ParentAnnouncementsPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const identity = await getCurrentIdentity(token)
  const list = (await getAnnouncements(token).catch(() => [])) as unknown as AnnouncementRecord[]

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
              <h1 className="text-2xl font-extrabold tracking-tight">School Broadcast Announcements</h1>
              <p className="text-sm text-muted-foreground">Targeted notifications and school announcements for parents.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcements Feed</CardTitle>
            <CardDescription>Live notices from school administration.</CardDescription>
          </CardHeader>
          <CardContent>
            {list.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Announcements"
                description="There are currently no announcements broadcasted."
              />
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Title & Message</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="font-semibold">{a.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-md">{a.body}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-xs font-mono">
                            {a.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{a.publishAt ? String(a.publishAt).slice(0, 10) : 'Immediate'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
