import { redirect } from 'next/navigation'
import { GraduationCap, Plus, Sparkles } from 'lucide-react'

import { recordStudentProgressAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProgressCategories } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ProgressCategoryRecord {
  id: string
  name: string
  description?: string | null
}

export default async function AdminProgressPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) redirect('/login')

  const token = sessionData.session.access_token
  const categories = (await getProgressCategories(token).catch(() => [])) as unknown as ProgressCategoryRecord[]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <GraduationCap className="size-4" />
            <span>Phase 5 Progress & Assessment</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Early-Grade Student Progress</h1>
          <p className="text-sm text-muted-foreground">
            Descriptive, graded, and literacy progress indicators with Parent publication workflow.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              + Record Progress Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Student Progress</DialogTitle>
            </DialogHeader>
            <form action={recordStudentProgressAction as unknown as (formData: FormData) => void} className="space-y-4 pt-2">
              <input type="hidden" name="studentId" value="11111111-1111-1111-1111-111111111111" />
              <input type="hidden" name="academicYearId" value="a0000000-0000-0000-0000-000000000001" />
              <input type="hidden" name="termId" value="t0000000-0000-0000-0000-000000000001" />

              <div className="space-y-2">
                <Label>Progress Category</Label>
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
                <Label htmlFor="rating">Rating Level</Label>
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
                <Label htmlFor="note">Teacher Descriptive Note</Label>
                <Input id="note" name="note" placeholder="Demonstrates strong oral vocabulary and letter recognition." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit">Save Progress Entry</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Assessment Categories</CardTitle>
          <CardDescription>Targeted areas for early childhood and primary grade evaluation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Card key={c.id} className="bg-card/50 backdrop-blur-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    {String(c.name)}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{c.description ? String(c.description) : 'General progress indicator.'}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
