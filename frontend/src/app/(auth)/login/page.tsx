import Link from 'next/link'
import { CheckCircle2, GraduationCap, Lock, ShieldCheck } from 'lucide-react'

import { LoginForm } from '@/components/auth/login-form'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-muted/30">
      {/* Left side branded hero panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 size-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <GraduationCap className="size-6 text-white" />
            </div>
            <span>NGO School ERP</span>
          </Link>

          <div className="mt-20 space-y-6 max-w-md">
            <Badge variant="outline" className="border-white/20 text-white bg-white/10">
              Authorized Portal Access
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Management Portal for Administrators, Teachers & Parents
            </h1>
            <p className="text-primary-foreground/80 leading-relaxed text-sm">
              Secure centralized access to academic setup, student profiles, family welfare records, and timetable operations.
            </p>

            <ul className="space-y-3 pt-4 text-sm text-primary-foreground/90">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Backend-enforced permission authorization</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Role-aware Admin, Teacher, and Parent portals</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-white" />
                <span>Audit logging for all sensitive administrative actions</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/70 flex items-center gap-2">
          <ShieldCheck className="size-4" />
          <span>NGO School ERP — Secure Cloud System</span>
        </div>
      </div>

      {/* Right side login card */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-md border-border/80">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex lg:hidden items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground mb-3">
              <GraduationCap className="size-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign In to Your Account</h2>
            <p className="text-sm text-muted-foreground">
              Accounts are created and managed by authorized administrators.
            </p>
          </div>

          <LoginForm next={params.next} />

          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Lock className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Public signup is disabled.</span> If you require portal access, please contact the school administration office.
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors" href="/">
              ← Return to Public Home Page
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
