import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

const navLinks = [
  { href: '/school', label: 'School Profile' },
  { href: '/academic-years', label: 'Academic Years' },
  { href: '/terms', label: 'Terms' },
  { href: '/classes', label: 'Classes' },
  { href: '/sections', label: 'Sections' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/teacher-assignments', label: 'Teacher Assignments' },
  { href: '/timetable', label: 'Timetable' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login?next=/school')

  let identity
  try {
    identity = await getCurrentIdentity(sessionData.session.access_token)
  } catch {
    await supabase.auth.signOut({ scope: 'local' })
    redirect('/login')
  }

  const isAdmin = identity.roles.some((role) => role.name === 'Admin')
  if (!isAdmin) redirect('/account')

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card px-6 py-3">
        <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
          <Link href="/account" className="mr-4 shrink-0 text-sm font-semibold text-foreground">
            NGO School ERP
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-auto shrink-0 text-sm text-muted-foreground">
            {identity.profile.fullName}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  )
}
