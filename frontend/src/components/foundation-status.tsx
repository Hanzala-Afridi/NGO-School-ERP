import { CheckCircle2, CircleDashed, School } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

const completed = [
  'Next.js App Router frontend',
  'Express TypeScript API',
  'Shared response contracts',
  'CI and Docker foundation',
]

export function FoundationStatus() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <section className="w-full max-w-2xl rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <School className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">NGO School ERP</p>
            <h1 className="text-2xl font-semibold tracking-tight">Phase Zero foundation</h1>
          </div>
        </div>

        <p className="mt-6 text-muted-foreground">
          The technical foundation is ready. Business modules remain intentionally disabled until
          their implementation phases are approved.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {completed.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-2 border-t pt-5 text-sm text-muted-foreground">
          <CircleDashed className="size-4" aria-hidden="true" />
          Phase One authentication and RBAC foundation
        </div>
        <Button asChild className="mt-5">
          <Link href="/login">Sign in</Link>
        </Button>
      </section>
    </main>
  )
}
