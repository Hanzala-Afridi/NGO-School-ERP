import {
  getAcademicYears,
  getClasses,
  getEnrollments,
  getParents,
  getStudents,
  getTeachers,
} from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '../_components/admin-dashboard'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const [students, parents, teachers, enrollments, classes, academicYears] = await Promise.all([
    getStudents(token).catch(() => []),
    getParents(token).catch(() => []),
    getTeachers(token).catch(() => []),
    getEnrollments(token).catch(() => []),
    getClasses(token).catch(() => []),
    getAcademicYears(token).catch(() => []),
  ])

  return (
    <AdminDashboard
      students={students}
      parents={parents}
      teachers={teachers}
      enrollments={enrollments}
      classes={classes}
      academicYears={academicYears}
    />
  )
}
