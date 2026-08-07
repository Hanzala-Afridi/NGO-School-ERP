import { PageHeader } from '@/components/layout/page-header'
import { getTeachers } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { TeachersList } from './_components/teachers-list'

export const metadata = { title: 'Teachers Directory — NGO School ERP' }

export default async function TeachersPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const teachers = await getTeachers(token).catch(() => [])

  const profiles = [
    { id: sessionData.session?.user.id ?? '00000000-0000-0000-0000-000000000000', fullName: 'Current Admin/Teacher', email: sessionData.session?.user.email ?? 'teacher@ngo.org' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Teachers Directory"
        description="Register faculty domain records, view employee numbers, qualifications, and employment status."
        breadcrumbs={[{ label: 'People' }, { label: 'Teachers' }]}
      />
      <TeachersList teachers={teachers} profiles={profiles} />
    </div>
  )
}
