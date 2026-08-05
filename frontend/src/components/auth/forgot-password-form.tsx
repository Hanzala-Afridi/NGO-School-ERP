'use client'

import { useActionState } from 'react'

import { forgotPasswordAction } from '@/app/auth/actions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {})
  return (
    <form action={action} className="space-y-4">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <Button className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Send recovery instructions'}
      </Button>
    </form>
  )
}
