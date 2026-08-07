import { redirect } from 'next/navigation'
import { BookOpen, Plus, Trash2 } from 'lucide-react'

import { createHomeworkAction, deleteHomeworkAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getHomework } from '@/lib/backend-api'
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

export default async function AdminHomeworkPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const list = (await getHomework(token).catch(() => [])) as unknown as HomeworkRecord[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <BookOpen className="size-4" />
            <span>Phase 5 Homework Module</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Homework Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Class homework assignments, publication management, and instructions tracking.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              + Create Homework Assignment
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
                <Input id="title" name="title" placeholder="e.g. Chapter 4 Multiplication Exercises" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Input id="instructions" name="instructions" placeholder="Complete Questions 1-10 on Page 45 in notebook." required />
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
          <CardTitle>Published Homework Catalog</CardTitle>
          <CardDescription>Homework assignments visible to Teachers and linked Parents.</CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Homework Assignments"
              description="No homework assignments have been published yet."
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
    </div>
  )
}
