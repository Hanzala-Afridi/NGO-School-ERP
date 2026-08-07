'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Calendar,
  Clock,
  Clock3,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  School,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavGroup {
  title: string
  items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>
}

const adminNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '/account', label: 'My Account', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academic Setup',
    items: [
      { href: '/school', label: 'School Profile', icon: School },
      { href: '/academic-years', label: 'Academic Years', icon: Calendar },
      { href: '/terms', label: 'Terms', icon: Clock3 },
      { href: '/classes', label: 'Classes', icon: Layers },
      { href: '/sections', label: 'Sections', icon: Home },
      { href: '/subjects', label: 'Subjects', icon: BookOpen },
      { href: '/teacher-assignments', label: 'Teacher Assignments', icon: UserCheck },
      { href: '/timetable', label: 'Timetable', icon: Clock },
    ],
  },
  {
    title: 'People & Enrollments',
    items: [
      { href: '/students', label: 'Students Directory', icon: GraduationCap },
      { href: '/parents', label: 'Parents Directory', icon: Users },
      { href: '/teachers', label: 'Teachers Directory', icon: UserCog },
      { href: '/enrollments', label: 'Academic Enrollments', icon: Layers },
    ],
  },
  {
    title: 'Attendance & Operations',
    items: [
      { href: '/attendance', label: 'Attendance Sessions', icon: UserCheck },
      { href: '/attendance/corrections', label: 'Correction Queue', icon: Clock },
    ],
  },
  {
    title: 'Academic Engagement',
    items: [
      { href: '/homework', label: 'Homework Assignments', icon: BookOpen },
      { href: '/progress', label: 'Student Progress', icon: GraduationCap },
      { href: '/announcements', label: 'Announcements', icon: Home },
    ],
  },
]

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex h-full flex-col bg-card border-r w-64 shrink-0', className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-foreground block">NGO School ERP</span>
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Admin Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {adminNavGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="border-t p-4 text-xs text-muted-foreground text-center">
        <span>NGO Free Education v1.0</span>
      </div>
    </aside>
  )
}
