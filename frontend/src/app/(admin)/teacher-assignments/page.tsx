import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import {
  getAcademicYears,
  getClasses,
  getSections,
  getSubjects,
  getTeacherAssignments,
} from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { TeacherAssignmentsList } from './_components/teacher-assignments-list'

export const metadata = { title: 'Teacher Assignments — NGO School ERP' }

export default async function TeacherAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ academicYearId?: string; classId?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')

  const { academicYearId, classId } = await searchParams
  const [academicYears, classes, sections, subjects, assignments] = await Promise.all([
    getAcademicYears(data.session.access_token),
    getClasses(data.session.access_token),
    getSections(data.session.access_token, classId),
    getSubjects(data.session.access_token),
    getTeacherAssignments(data.session.access_token, { academicYearId, classId }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Assignments Management"
        description="Assign faculty members as Class Teachers or Subject Teachers across academic years, classes, and sections."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Teacher Assignments' }]}
      />
      <TeacherAssignmentsList
        assignments={assignments}
        academicYears={academicYears}
        classes={classes}
        sections={sections}
        subjects={subjects}
        selectedAcademicYearId={academicYearId}
        selectedClassId={classId}
      />
    </div>
  )
}
