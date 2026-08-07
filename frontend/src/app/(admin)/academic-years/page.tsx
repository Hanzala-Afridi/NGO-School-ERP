import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getAcademicYears, getSchools } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
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
    <div className="space-y-6">
      <PageHeader
        title="Academic Years Management"
        description="Configure school session periods and date ranges."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Academic Years' }]}
      />
      <AcademicYearsList years={years} schoolId={school?.id ?? ''} />
    </div>
  )
}
