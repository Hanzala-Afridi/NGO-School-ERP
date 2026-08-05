'use server'

import { redirect } from 'next/navigation'

import * as backend from '@/lib/backend-api'
import { createClient } from '@/lib/supabase/server'

export interface ActionState {
  error?: string
  message?: string
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const requestedNext = String(formData.get('next') ?? '/account')
  try {
    const session = await backend.login(email, password)
    const supabase = await createClient()
    const { error } = await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })
    if (error) throw error
  } catch {
    return { error: 'Unable to sign in with those credentials.' }
  }
  redirect(
    requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/account',
  )
}

export async function forgotPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get('email') ?? '')
  try {
    const result = await backend.requestPasswordRecovery(email)
    return { message: result.message }
  } catch {
    return { message: 'If the account exists, password recovery instructions have been sent.' }
  }
}

export async function resetPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('passwordConfirmation') ?? '')
  if (password !== confirmation) return { error: 'Passwords do not match.' }
  if (password.length < 12) return { error: 'Password must contain at least 12 characters.' }
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session) return { error: 'The password reset session has expired.' }
    await backend.updatePassword(data.session.access_token, password)
  } catch {
    return { error: 'The password could not be updated.' }
  }
  redirect('/account')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    try {
      await backend.logout(data.session.access_token)
    } catch {
      // Always clear the browser session even if server-side revocation is unavailable.
    }
  }
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/login')
}
