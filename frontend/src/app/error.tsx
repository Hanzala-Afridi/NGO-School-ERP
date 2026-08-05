'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('A frontend rendering error occurred', { digest: error.digest })
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">The page could not be loaded. Please try again.</p>
        <Button onClick={reset}>Try again</Button>
      </section>
    </main>
  )
}
