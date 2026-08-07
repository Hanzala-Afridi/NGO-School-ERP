import { redirect } from 'next/navigation'

import { PageHeader } from '@/components/layout/page-header'
import { getAcademicYears, getTerms } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
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
    <div className="space-y-6">
      <PageHeader
        title="Academic Terms Management"
        description="Manage term periods (e.g. Midterm, Final Term) within an academic year."
        breadcrumbs={[{ label: 'Academic Setup' }, { label: 'Terms' }]}
      />
      <TermsList terms={terms} academicYears={years} selectedYearId={academicYearId} />
    </div>
  )
}
