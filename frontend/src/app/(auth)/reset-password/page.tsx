import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use at least 12 characters and a password unique to this account.
          </p>
        </div>
        <ResetPasswordForm />
      </Card>
    </main>
  )
}
