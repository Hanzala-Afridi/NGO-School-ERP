import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getCampuses, getSchools } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { SchoolProfileForm } from './_components/school-profile-form'

export const metadata = { title: 'School Profile — NGO School ERP' }

export default async function SchoolPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')

  const [schools, campuses] = await Promise.all([
    getSchools(data.session.access_token),
    getCampuses(data.session.access_token),
  ])

  const school = schools[0]
  const campus = campuses[0]

  if (!school) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center">
        No school record found. Apply the system migration first.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Profile & Campus Configuration"
        description="Manage school name, code, contact information, and default campus settings."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'School Profile' }]}
      />
      <div className="max-w-3xl">
        <SchoolProfileForm school={school} campus={campus ?? null} />
      </div>
    </div>
  )
}
