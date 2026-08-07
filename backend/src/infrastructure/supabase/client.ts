import { createClient } from '@supabase/supabase-js'
import { environment } from '../../config/env.js'

export const fetchWithTimeout = (url: string | URL | Request, options?: RequestInit) => {
  const controller = new AbortController()
  const timeoutMs = environment.DB_QUERY_TIMEOUT_MS || 5000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
}

const commonOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
  global: {
    fetch: fetchWithTimeout,
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
      fetch: fetchWithTimeout,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
