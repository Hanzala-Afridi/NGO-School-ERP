import { notFound } from 'next/navigation'

import {
  getParents,
  getStudent,
  getStudentDocuments,
  getStudentHistory,
  getStudentParents,
  getStudentSiblings,
} from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'
import { StudentDetail } from './_components/student-detail'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const student = await getStudent(token, id).catch(() => null)
  if (!student) notFound()

  const [documents, parents, parentLinks, siblings, history] = await Promise.all([
    getStudentDocuments(token, id).catch(() => []),
    getParents(token).catch(() => []),
    getStudentParents(token, id).catch(() => []),
    getStudentSiblings(token, id).catch(() => []),
    getStudentHistory(token, id).catch(() => []),
  ])

  return (
    <StudentDetail
      student={student}
      documents={documents}
      parents={parents}
      parentLinks={parentLinks}
      siblings={siblings}
      history={history}
    />
  )
}
