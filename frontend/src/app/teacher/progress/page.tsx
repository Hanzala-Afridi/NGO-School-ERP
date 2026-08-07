import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Plus, Sparkles } from 'lucide-react'

import { recordStudentProgressAction } from '@/app/admin/actions'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCurrentIdentity, getProgressCategories } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ProgressCategoryRecord {
  id: string
  name: string
  description?: string | null
}

export default async function TeacherProgressPage() {
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
              <Link href="/teacher">
                <ArrowLeft className="size-4 mr-1" /> Portal Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Student Progress Evaluations</h1>
              <p className="text-sm text-muted-foreground">Record early-grade developmental and subject performance indicators.</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                + Record Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Progress Entry</DialogTitle>
              </DialogHeader>
              <form action={recordStudentProgressAction as unknown as (formData: FormData) => void} className="space-y-4 pt-2">
                <input type="hidden" name="studentId" value="11111111-1111-1111-1111-111111111111" />
                <input type="hidden" name="academicYearId" value="a0000000-0000-0000-0000-000000000001" />
                <input type="hidden" name="termId" value="t0000000-0000-0000-0000-000000000001" />

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="categoryId" defaultValue={categories[0]?.id ? String(categories[0].id) : ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {String(c.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select name="rating" defaultValue="3 - Competent">
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 - Needs Support">1 - Needs Support</SelectItem>
                      <SelectItem value="2 - Developing">2 - Developing</SelectItem>
                      <SelectItem value="3 - Competent">3 - Competent</SelectItem>
                      <SelectItem value="4 - Excellent">4 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Descriptive Note</Label>
                  <Input id="note" name="note" placeholder="Shows good progress in reading simple sentences." />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit">Save Progress</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Categories</CardTitle>
            <CardDescription>Approved early-grade rating metrics.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
