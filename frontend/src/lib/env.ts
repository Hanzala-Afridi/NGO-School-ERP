import { z } from 'zod'

const serverEnvironmentSchema = z.object({
  BACKEND_URL: z.string().url().default('http://localhost:4000'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
})

export const serverEnvironment = serverEnvironmentSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

export const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
})
