import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getSubjects, getSchools } from '@/lib/backend-api'
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Subjects</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage the subjects taught at the school.
      </p>
      <SubjectsList subjects={subjects} schoolId={school?.id ?? ''} />
    </div>
  )
}
