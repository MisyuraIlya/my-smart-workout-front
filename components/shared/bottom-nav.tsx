'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboardIcon, DumbbellIcon, CalendarIcon, BarChart3Icon, ActivityIcon, HeartPulseIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

function BottomNavInner() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const items = [
    { href: '/dashboard' as const, label: t('dashboard'), icon: LayoutDashboardIcon },
    { href: '/cardio' as const, label: t('cardio'), icon: HeartPulseIcon },
    { href: '/programs' as const, label: t('programs'), icon: CalendarIcon },
    { href: '/exercises' as const, label: t('exercises'), icon: ActivityIcon },
    { href: '/sessions' as const, label: t('sessions'), icon: DumbbellIcon },
    { href: '/statistics' as const, label: t('statistics'), icon: BarChart3Icon },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.includes(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function BottomNav() {
  return (
    <Suspense fallback={<nav className="fixed bottom-0 left-0 right-0 h-14 border-t bg-background" />}>
      <BottomNavInner />
    </Suspense>
  )
}
