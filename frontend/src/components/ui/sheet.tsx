'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (val: boolean) => {
    setUncontrolledOpen(val)
    onOpenChange?.(val)
  }

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)
  return (
    <div className="inline-block cursor-pointer" onClick={() => ctx?.setOpen(true)}>
      {children}
    </div>
  )
}

export function SheetContent({
  side = 'left',
  className,
  children,
}: {
  side?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(SheetContext)
  if (!ctx?.open) return null

  const sideStyles = side === 'left' ? 'left-0 h-full w-72' : 'right-0 h-full w-72'

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50">
      <div className="fixed inset-0" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          'relative z-10 bg-background p-6 shadow-2xl transition-transform duration-300 ease-in-out',
          sideStyles,
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col space-y-1 text-left', className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-lg font-semibold tracking-tight text-foreground', className)} {...props} />
}
