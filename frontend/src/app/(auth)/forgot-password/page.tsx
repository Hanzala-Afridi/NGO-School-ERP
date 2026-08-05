import Link from 'next/link'

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Card } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email address assigned to your account.
          </p>
        </div>
        <ForgotPasswordForm />
        <Link className="block text-center text-sm text-primary hover:underline" href="/login">
          Back to sign in
        </Link>
      </Card>
    </main>
  )
}
