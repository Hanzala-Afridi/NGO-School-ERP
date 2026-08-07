import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import {
  getAcademicYears,
  getClasses,
  getSections,
  getSubjects,
  getTimetableEntries,
} from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
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
    <div className="space-y-6">
      <PageHeader
        title="Weekly Timetable Schedule"
        description="Schedule weekly class period slots, subject allocations, and classroom locations."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Timetable' }]}
      />
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
