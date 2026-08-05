import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getAcademicYears, getTerms } from '@/lib/backend-api'
import { TermsList } from './_components/terms-list'

export const metadata = { title: 'Terms — NGO School ERP' }

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ academicYearId?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect('/login')
  const { academicYearId } = await searchParams
  const [years, terms] = await Promise.all([
    getAcademicYears(data.session.access_token),
    getTerms(data.session.access_token, academicYearId),
  ])
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Terms</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage terms within an academic year.</p>
      <TermsList terms={terms} academicYears={years} selectedYearId={academicYearId} />
    </div>
  )
}
