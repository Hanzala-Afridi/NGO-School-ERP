import Link from 'next/link'

import { LoginForm } from '@/components/auth/login-form'
import { Card } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">NGO School ERP</p>
          <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accounts are created by an authorized Administrator.
          </p>
        </div>
        <LoginForm next={params.next} />
        <Link className="block text-center text-sm text-primary hover:underline" href="/">
          Return home
        </Link>
      </Card>
    </main>
  )
}
