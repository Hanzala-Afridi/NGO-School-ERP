import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { publicEnvironment } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components cannot write cookies; proxy.ts performs refresh writes.
          }
        },
      },
    },
  )
}
