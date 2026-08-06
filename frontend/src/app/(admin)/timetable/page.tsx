import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
  getAcademicYears,
  getClasses,
  getSections,
  getSubjects,
  getTimetableEntries,
} from '@/lib/backend-api'
import { TimetableList } from './_components/timetable-list'

export const metadata = { title: 'Timetable — NGO School ERP' }

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ academicYearId?: string; classId?: string; sectionId?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')

  const { academicYearId, classId, sectionId } = await searchParams
  const [academicYears, classes, sections, subjects, entries] = await Promise.all([
    getAcademicYears(data.session.access_token),
    getClasses(data.session.access_token),
    getSections(data.session.access_token, classId),
    getSubjects(data.session.access_token),
    getTimetableEntries(data.session.access_token, { academicYearId, classId, sectionId }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Timetable Foundation</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage weekly schedule slots for classes and subjects.
      </p>
      <TimetableList
        entries={entries}
        academicYears={academicYears}
        classes={classes}
        sections={sections}
        subjects={subjects}
        selectedAcademicYearId={academicYearId}
        selectedClassId={classId}
        selectedSectionId={sectionId}
      />
    </div>
  )
}
