import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getClasses, getSections } from '@/lib/backend-api'
import { SectionsList } from './_components/sections-list'

export const metadata = { title: 'Sections — NGO School ERP' }

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')
  const { classId } = await searchParams
  const [classes, sections] = await Promise.all([
    getClasses(data.session.access_token),
    getSections(data.session.access_token, classId),
  ])
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Sections</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage sections within a class, such as Section A or Section B.
      </p>
      <SectionsList sections={sections} classes={classes} selectedClassId={classId} />
    </div>
  )
}
