import { createBrowserClient } from '@supabase/ssr'

import { publicEnvironment } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}
