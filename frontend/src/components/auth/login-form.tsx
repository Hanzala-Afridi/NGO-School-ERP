'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { loginAction } from '@/app/auth/actions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ next = '/account' }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, {})
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between gap-4">
          <Label htmlFor="password">Password</Label>
          <Link className="text-sm text-primary hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button className="w-full" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
