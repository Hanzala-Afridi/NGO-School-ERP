'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (val: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  children,
  name,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  name?: string
}) {
  const [val, setVal] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const currentValue = isControlled ? valueProp : val

  const handleValueChange = (v: string) => {
    if (!isControlled) setVal(v)
    onValueChange?.(v)
  }

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      {children}
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <div className={cn('relative w-full', className)}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return placeholder ? <span className="sr-only">{placeholder}</span> : null
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)
  return (
    <select
      value={ctx?.value ?? ''}
      onChange={(e) => ctx?.onValueChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}
