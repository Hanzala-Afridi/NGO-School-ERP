import { PageHeader } from '@/components/layout/page-header'
import {
  getAcademicYears,
  getClasses,
  getEnrollments,
  getSections,
  getStudents,
} from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { EnrollmentsList } from './_components/enrollments-list'

export const metadata = { title: 'Enrollments Lifecycle — NGO School ERP' }

export default async function EnrollmentsPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const [enrollments, students, academicYears, classes, sections] = await Promise.all([
    getEnrollments(token).catch(() => []),
    getStudents(token).catch(() => []),
    getAcademicYears(token).catch(() => []),
    getClasses(token).catch(() => []),
    getSections(token).catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic Enrollments Lifecycle"
        description="Manage active student class enrollments, promotions to higher grades, transfers, and withdrawals."
        breadcrumbs={[{ label: 'Enrollments' }]}
      />
      <EnrollmentsList
        enrollments={enrollments}
        students={students}
        academicYears={academicYears}
        classes={classes}
        sections={sections}
      />
    </div>
  )
}
