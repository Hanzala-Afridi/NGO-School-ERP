import { PageHeader } from '@/components/layout/page-header'
import { getParents } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { ParentsList } from './_components/parents-list'

export const metadata = { title: 'Parents Directory — NGO School ERP' }

export default async function ParentsPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const parents = await getParents(token).catch(() => [])

  const profiles = [
    { id: sessionData.session?.user.id ?? '00000000-0000-0000-0000-000000000000', fullName: 'Current Admin', email: sessionData.session?.user.email ?? 'admin@ngo.org' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians Directory"
        description="Search, create, and manage parent profiles linked to enrolled students."
        breadcrumbs={[{ label: 'People' }, { label: 'Parents' }]}
      />
      <ParentsList parents={parents} profiles={profiles} />
    </div>
  )
}
