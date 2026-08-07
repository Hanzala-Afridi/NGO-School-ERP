import { PageHeader } from '@/components/layout/page-header'
import { getSchools, getStudents } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { StudentsList } from './_components/students-list'

export const metadata = { title: 'Students Directory — NGO School ERP' }

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const [students, schools] = await Promise.all([
    getStudents(token).catch(() => []),
    getSchools(token).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Registration Directory"
        description="Search, filter, register, update, and manage student demographic profiles and records."
        breadcrumbs={[{ label: 'People' }, { label: 'Students' }]}
      />
      <StudentsList students={students} schools={schools} />
    </div>
  )
}
