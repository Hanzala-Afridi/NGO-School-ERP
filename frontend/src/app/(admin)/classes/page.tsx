import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getClasses, getSchools } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { ClassesList } from './_components/classes-list'

export const metadata = { title: 'Classes — NGO School ERP' }

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')

  const [schools, classes] = await Promise.all([
    getSchools(data.session.access_token),
    getClasses(data.session.access_token),
  ])

  const school = schools[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class & Grade Levels Configuration"
        description="Manage academic grade levels. Pre-seeded with KG 1, KG 2, KG 3, Class 1, Class 2, and Class 3."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Classes' }]}
      />
      <ClassesList classes={classes} schoolId={school?.id ?? ''} />
    </div>
  )
}
