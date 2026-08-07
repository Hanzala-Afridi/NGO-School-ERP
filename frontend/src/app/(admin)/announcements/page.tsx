import { redirect } from 'next/navigation'
import { Bell, Plus, Send } from 'lucide-react'

import { createAnnouncementAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAnnouncements } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface AnnouncementRecord {
  id: string
  title: string
  body: string
  priority: string
  publishAt?: string | null
  status: string
}

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const list = (await getAnnouncements(token).catch(() => [])) as unknown as AnnouncementRecord[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Bell className="size-4" />
            <span>Phase 5 Communication Module</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">School Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Targeted notifications and broadcast announcements for Parents, Teachers, and Staff.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              + Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <form action={createAnnouncementAction as unknown as (formData: FormData) => void} className="space-y-4 pt-2">
              <input type="hidden" name="schoolId" value="sch00000-0000-0000-0000-000000000001" />

              <div className="space-y-2">
                <Label htmlFor="title">Headline Title</Label>
                <Input id="title" name="title" placeholder="e.g. Mid-Term Parent-Teacher Meeting Scheduled" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Announcement Content</Label>
                <Input id="body" name="body" placeholder="Detailed message for parents and teachers." required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Input id="priority" name="priority" defaultValue="normal" placeholder="low | normal | high | urgent" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit">
                  <Send className="size-4 mr-1.5" /> Publish Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Announcements Feed</CardTitle>
          <CardDescription>Live broadcast notices visible across role portals.</CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Announcements Found"
              description="No announcements have been broadcasted yet."
            />
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Headline & Content</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold uppercase text-xs">
                          {a.status}
                        </Badge>
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
