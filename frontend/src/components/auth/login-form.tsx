'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react'

import { loginAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ next = '/account' }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3.5 text-sm font-medium text-destructive border border-destructive/20 animate-in fade-in-0">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
            className="pl-9"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <Link className="text-xs font-medium text-primary hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pl-9 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button className="w-full font-semibold shadow-sm mt-2" disabled={pending}>
        {pending ? 'Authenticating...' : 'Sign In'}
      </Button>
    </form>
  )
}
