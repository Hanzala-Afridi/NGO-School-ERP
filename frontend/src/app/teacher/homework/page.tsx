import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BookOpen, Plus, Trash2 } from 'lucide-react'

import { createHomeworkAction, deleteHomeworkAction } from '@/app/admin/actions'
import { AppHeader } from '@/components/layout/app-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentIdentity, getHomework } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface HomeworkRecord {
  id: string
  title: string
  instructions: string
  assignedDate: string
  dueDate: string
  status: string
}

export default async function TeacherHomeworkPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const identity = await getCurrentIdentity(token)
  const list = (await getHomework(token).catch(() => [])) as unknown as HomeworkRecord[]

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
              <h1 className="text-2xl font-extrabold tracking-tight">Class Homework Assignments</h1>
              <p className="text-sm text-muted-foreground">Manage and publish homework tasks for assigned classes.</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                + Create Homework
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Homework Assignment</DialogTitle>
              </DialogHeader>
              <form action={createHomeworkAction as unknown as (formData: FormData) => void} className="space-y-4 pt-2">
                <input type="hidden" name="teacherAssignmentId" value="ta000000-0000-0000-0000-000000000001" />

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Science Diagram Practice" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Input id="instructions" name="instructions" placeholder="Draw and label parts of a plant in your notebook." required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedDate">Assigned Date</Label>
                    <Input id="assignedDate" name="assignedDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit">Publish Homework</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Published Homework Catalog</CardTitle>
            <CardDescription>Homework assignments created for your assigned classes.</CardDescription>
          </CardHeader>
          <CardContent>
            {list.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Homework Created"
                description="Click '+ Create Homework' to assign tasks to your class."
              />
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Title & Instructions</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          <div className="font-semibold">{h.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-sm">{h.instructions}</div>
                        </TableCell>
                        <TableCell className="text-xs">{h.assignedDate}</TableCell>
                        <TableCell className="font-semibold text-xs text-amber-600">{h.dueDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold uppercase text-xs">
                            {h.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={deleteHomeworkAction as unknown as (formData: FormData) => void} className="inline">
                            <input type="hidden" name="id" value={h.id} />
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80">
                              <Trash2 className="size-3.5" />
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
      </main>
    </div>
  )
}
