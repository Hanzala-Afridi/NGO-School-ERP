import { createClient } from '@supabase/supabase-js'

import { environment } from '../../config/env.js'

const commonOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
} as const

export function createPublicSupabaseClient() {
  return createClient(environment.SUPABASE_URL, environment.SUPABASE_PUBLISHABLE_KEY, commonOptions)
}

export function createAdminSupabaseClient() {
  return createClient(environment.SUPABASE_URL, environment.SUPABASE_SECRET_KEY, commonOptions)
}

export function createUserSupabaseClient(accessToken: string) {
  return createClient(environment.SUPABASE_URL, environment.SUPABASE_PUBLISHABLE_KEY, {
    ...commonOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
