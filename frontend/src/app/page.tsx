import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PUBLIC_CONTENT } from '@/lib/constants/public-content'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-fade-up">
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-primary hover:opacity-90 transition-opacity">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" aria-hidden="true" />
            </div>
            <span>NGO School ERP</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">
              About School
            </a>
            <a href="#programs" className="hover:text-foreground transition-colors">
              Education Programs
            </a>
            <a href="#impact" className="hover:text-foreground transition-colors">
              Our Impact
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="font-semibold shadow-sm transition-all hover:scale-[1.02]">
              <Link href="/login">Sign In to Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs bg-primary/10 border-primary/20 text-primary font-medium inline-flex">
                <Sparkles className="size-3.5" />
                {PUBLIC_CONTENT.hero.badge}
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.12]">
                Empowering Every Child Through <span className="text-primary">Free Education</span> & Welfare Support
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {PUBLIC_CONTENT.hero.description}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button asChild size="lg" className="font-semibold px-8 shadow-md transition-all hover:scale-[1.02]">
                  <Link href="/login">{PUBLIC_CONTENT.hero.ctaPrimary}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#impact">{PUBLIC_CONTENT.hero.ctaSecondary}</a>
                </Button>
              </div>
            </div>

            {/* Right Asymmetrical Feature Panel */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-xl pointer-events-none" />
              <div className="relative space-y-4">
                <Card className="border-primary/20 shadow-md bg-card/90 backdrop-blur">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">KG 1 to Class 3 Education</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Comprehensive early-grade foundational learning curriculum.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20 shadow-md bg-card/90 backdrop-blur ml-6">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <HeartHandshake className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Monthly Ration Support</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Family nutrition support for eligible student households.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 shadow-md bg-card/90 backdrop-blur">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Verified Administration</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Centralized digital record management with audit security.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Impact Statistics Section ─────────────────────────────────── */}
      <section id="impact" className="py-12 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {PUBLIC_CONTENT.stats.map((stat, i) => (
              <Card key={i} className="border-primary/10 transition-all hover:shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">{stat.value}</div>
                  <p className="text-xs font-semibold text-muted-foreground mt-1.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ─────────────────────────────────────────────── */}
      <section id="programs" className="py-16 md:py-20 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Holistic Student Support Services</h2>
            <p className="text-muted-foreground text-sm">
              Combining early-grade academic development with essential welfare distribution and transparent management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <BookOpen className="size-6" />
                </div>
                <CardTitle className="text-lg font-bold">{PUBLIC_CONTENT.services[0].title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {PUBLIC_CONTENT.services[0].description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-md hover:border-accent/30">
              <CardHeader>
                <div className="size-12 rounded-xl bg-accent/20 text-accent-foreground flex items-center justify-center mb-2">
                  <HeartHandshake className="size-6" />
                </div>
                <CardTitle className="text-lg font-bold">{PUBLIC_CONTENT.services[1].title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {PUBLIC_CONTENT.services[1].description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <ShieldCheck className="size-6" />
                </div>
                <CardTitle className="text-lg font-bold">{PUBLIC_CONTENT.services[2].title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {PUBLIC_CONTENT.services[2].description}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Contact Section ───────────────────────────────────────────────── */}
      <section id="contact" className="py-16 bg-card border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold">{PUBLIC_CONTENT.contact.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight">{PUBLIC_CONTENT.contact.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {PUBLIC_CONTENT.contact.description}
              </p>

              <ul className="space-y-3 text-sm text-muted-foreground pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span><strong>Address:</strong> {PUBLIC_CONTENT.contact.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span><strong>Phone:</strong> {PUBLIC_CONTENT.contact.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span><strong>Email:</strong> {PUBLIC_CONTENT.contact.email}</span>
                </li>
              </ul>
            </div>

            <Card className="p-6 shadow-sm border-border/80">
              <CardHeader className="p-0 mb-4 space-y-1">
                <CardTitle className="text-lg font-bold">Portal Access Reminder</CardTitle>
                <CardDescription className="text-xs">
                  Student registration and account access are managed strictly by authorized administrators.
                </CardDescription>
              </CardHeader>
              <Button asChild className="w-full font-semibold shadow-xs">
                <Link href="/login">Go to Portal Sign In</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t bg-muted/40 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="size-4 text-primary" />
            <span>NGO School Management ERP</span>
          </div>
          <p>© {new Date().getFullYear()} NGO Free Education Initiative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
