import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getAcademicYears, getSchools } from '@/lib/backend-api'
import { AcademicYearsList } from './_components/academic-years-list'

export const metadata = { title: 'Academic Years — NGO School ERP' }

export default async function AcademicYearsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')
  const [schools, years] = await Promise.all([
    getSchools(data.session.access_token),
    getAcademicYears(data.session.access_token),
  ])
  const school = schools[0]
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Academic Years</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage academic year periods for the school.
      </p>
      <AcademicYearsList years={years} schoolId={school?.id ?? ''} />
    </div>
  )
}
