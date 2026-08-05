'use client'

import { useActionState } from 'react'

import { resetPasswordAction } from '@/app/auth/actions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, {})
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={12} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation">Confirm password</Label>
        <Input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          minLength={12}
          required
        />
      </div>
      <Button className="w-full" disabled={pending}>
        {pending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}
