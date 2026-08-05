import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getClasses, getSchools } from '@/lib/backend-api'
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Classes</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage grade levels. KG 1–Class 3 are pre-seeded.
      </p>
      <ClassesList classes={classes} schoolId={school?.id ?? ''} />
    </div>
  )
}
