import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getSchools, getSubjects } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { SubjectsList } from './_components/subjects-list'

export const metadata = { title: 'Subjects — NGO School ERP' }

export default async function SubjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')

  const [schools, subjects] = await Promise.all([
    getSchools(data.session.access_token),
    getSubjects(data.session.access_token),
  ])

  const school = schools[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Subjects Management"
        description="Manage academic subjects (e.g. English, Urdu, Mathematics, General Science) taught across grade levels."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Subjects' }]}
      />
      <SubjectsList subjects={subjects} schoolId={school?.id ?? ''} />
    </div>
  )
}
