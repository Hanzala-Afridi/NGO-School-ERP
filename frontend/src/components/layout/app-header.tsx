'use client'

import Link from 'next/link'
import { Menu, User } from 'lucide-react'

import { LogoutButton } from '@/components/auth/logout-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AppSidebar } from './app-sidebar'

interface AppHeaderProps {
  userFullName: string
  roles: string[]
}

export function AppHeader({ userFullName, roles }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Drawer Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="size-5" />
                <span className="sr-only">Toggle Sidebar Navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0">
              <AppSidebar className="w-full border-r-0" />
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>Role Scope:</span>
          {roles.map((r) => (
            <Badge key={r} variant="secondary" className="font-semibold bg-primary/10 text-primary border-primary/20">
              {r}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/account"
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            {userFullName ? userFullName.charAt(0).toUpperCase() : <User className="size-4" />}
          </div>
          <span className="hidden sm:inline font-semibold">{userFullName}</span>
        </Link>
        <LogoutButton />
      </div>
    </header>
  )
}
