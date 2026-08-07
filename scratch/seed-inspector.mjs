import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.resolve(process.cwd(), 'backend', '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...val] = trimmed.split('=')
    if (key && val.length) {
      process.env[key.trim()] = val.join('=').trim()
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://ypxgsurqdxigpjjgdmds.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function check() {
  const tables = [
    'schools',
    'academic_years',
    'terms',
    'classes',
    'sections',
    'subjects',
    'teachers',
    'teacher_assignments',
    'timetable_entries',
    'students',
    'parents',
    'student_parents',
    'enrollments',
    'attachments',
  ]

  console.log('=== Remote Database Record Counts ===')
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`${t}: ERROR -> ${error.message}`)
    } else {
      console.log(`${t}: ${count} records`)
    }
  }
}

check().catch(console.error)
