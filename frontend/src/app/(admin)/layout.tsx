import { redirect } from 'next/navigation'

import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

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

  const roleNames = identity.roles.map((r) => r.name)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Fixed Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content Shell */}
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader userFullName={identity.profile.fullName} roles={roleNames} />
        <main className="flex-1 p-6 md:p-8 mx-auto w-full max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
