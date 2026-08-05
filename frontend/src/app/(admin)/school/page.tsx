import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getSchools, getCampuses } from '@/lib/backend-api'
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
      <div className="text-muted-foreground text-sm">
        No school record found. Apply the Phase 2A migration first.
      </div>
    )
  }
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">School Profile</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Edit the school name and contact details.
      </p>
      <SchoolProfileForm school={school} campus={campus ?? null} />
    </div>
  )
}
