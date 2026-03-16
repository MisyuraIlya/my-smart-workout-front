'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { useSessions } from '@/lib/hooks/use-sessions'
import type { WorkoutSession } from '@/lib/api/workout'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

function getNextTwoWeeks() {
  const today = new Date()
  const from = today.toISOString().slice(0, 10)
  const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return { from, to }
}

function getDays() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function UpcomingSessions() {
  const t = useTranslations('dashboard')
  const { from, to } = getNextTwoWeeks()
  const { data, isLoading } = useSessions({ status: 'planned', from, to, limit: 50 })

  const sessions = data?.items ?? []
  const sessionsByDate = sessions.reduce<Record<string, WorkoutSession>>((acc, s: WorkoutSession) => {
    acc[s.scheduled_on] = s
    return acc
  }, {})

  const days = getDays()
  const today = days[0]
  const nearestSessionDate = days.find((d: string) => sessionsByDate[d])

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted-foreground">{t('upcomingSessions')}</h2>
      {isLoading ? (
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-12 shrink-0 rounded-lg" />
          ))}
        </div>
      ) : (
        <ScrollArea orientation="horizontal">
          <div className="flex gap-2 pb-2">
            {days.map((date: string) => {
              const session = sessionsByDate[date]
              const d = new Date(date + 'T00:00:00')
              const isToday = date === today
              const isNearest = date === nearestSessionDate
              return (
                <div
                  key={date}
                  className={cn(
                    'flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2',
                    isToday && !isNearest && 'border-primary bg-primary/5',
                    isNearest && 'border-primary bg-primary text-primary-foreground',
                    !isNearest && session && 'bg-card',
                  )}
                >
                  <span className={cn('text-xs', isNearest ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {DAY_SHORT[d.getDay()]}
                  </span>
                  <span className={cn('text-sm font-semibold', isToday && !isNearest && 'text-primary')}>
                    {d.getDate()}
                  </span>
                  {session ? (
                    <Link href={`/sessions/${session.id}`} className="mt-1">
                      <span className={cn('size-2 rounded-full block', isNearest ? 'bg-primary-foreground' : 'bg-primary')} />
                    </Link>
                  ) : (
                    <span className="mt-1 size-2 rounded-full bg-transparent block" />
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
