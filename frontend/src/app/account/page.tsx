import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { Card } from '@/components/ui/card'
import { getCurrentIdentity } from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const [{ data: claims }, { data: sessionData }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getSession(),
  ])
  if (!claims?.claims || !sessionData.session) redirect('/login')

  let identity
  try {
    identity = await getCurrentIdentity(sessionData.session.access_token)
  } catch {
    await supabase.auth.signOut({ scope: 'local' })
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-muted/40 p-6 sm:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Authenticated account</p>
            <h1 className="text-2xl font-semibold">{identity.profile.fullName}</h1>
          </div>
          <LogoutButton />
        </header>

        <Card>
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{identity.profile.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{identity.profile.status}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold">Roles and permissions</h2>
          <p className="mt-2 text-sm">
            {identity.roles.map((role) => role.name).join(', ') || 'No role assigned'}
          </p>
          <ul className="mt-4 grid gap-2 font-mono text-xs sm:grid-cols-2">
            {identity.permissions.map((permission) => (
              <li key={permission} className="rounded bg-muted px-2 py-1">
                {permission}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  )
}
