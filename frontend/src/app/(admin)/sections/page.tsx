import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getClasses, getSections } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
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
    <div className="space-y-6">
      <PageHeader
        title="Class Sections Management"
        description="Manage class sections (e.g. Section A, Section B) and student capacities."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Sections' }]}
      />
      <SectionsList sections={sections} classes={classes} selectedClassId={classId} />
    </div>
  )
}
