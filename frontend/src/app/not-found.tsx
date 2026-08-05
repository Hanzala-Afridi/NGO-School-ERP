import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md space-y-4 text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </main>
  )
}
