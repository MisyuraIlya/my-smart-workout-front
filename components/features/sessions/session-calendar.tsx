'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations, useFormatter, useLocale } from 'next-intl'
import { XIcon } from 'lucide-react'
import { enUS, ru, he } from 'date-fns/locale'

import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

import { useSessionsForMonth } from '@/lib/hooks/use-sessions'
import { SessionCard } from './session-card'
import { SessionList } from './session-list'

const DATE_FNS_LOCALES: Record<string, typeof enUS> = { en: enUS, ru, he }

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function monthBounds(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { from: toYMD(first), to: toYMD(last) }
}

function localDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function SessionCalendarView() {
  const t = useTranslations('sessions')
  const format = useFormatter()
  const locale = useLocale()

  const [month, setMonth] = useState<Date>(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const { from, to } = monthBounds(month)
  const { data: monthData, isLoading } = useSessionsForMonth(from, to)

  // YYYY-MM-DD strings that have sessions this month
  const sessionDaySet = useMemo(() => {
    const set = new Set<string>()
    monthData?.items.forEach((s) => set.add(s.scheduled_on.slice(0, 10)))
    return set
  }, [monthData])

  // Date objects for the `hasSessions` modifier (local time, no timezone shift)
  const sessionDates = useMemo(
    () => Array.from(sessionDaySet).map(localDate),
    [sessionDaySet],
  )

  // Sessions filtered to the selected day (in-memory — no extra request)
  const selectedKey = selectedDate ? toYMD(selectedDate) : null
  const selectedSessions = useMemo(() => {
    if (!selectedKey) return null
    return monthData?.items.filter((s) => s.scheduled_on.slice(0, 10) === selectedKey) ?? []
  }, [selectedKey, monthData])

  const handleMonthChange = useCallback((newMonth: Date) => {
    setMonth(newMonth)
    setSelectedDate(undefined)
  }, [])

  // Custom DayButton: renders a dot indicator for days that have sessions
  const DayButtonWithDot = useCallback(
    ({ children, day, modifiers, ...props }: React.ComponentProps<typeof CalendarDayButton>) => {
      const hasSessions = (modifiers as Record<string, boolean>).hasSessions
      return (
        <CalendarDayButton day={day} modifiers={modifiers} {...props}>
          {children}
          {hasSessions && (
            <span
              className={cn(
                'pointer-events-none absolute bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full',
                modifiers.selected ? 'bg-primary-foreground' : 'bg-primary',
              )}
            />
          )}
        </CalendarDayButton>
      )
    },
    [],
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Month calendar */}
      {isLoading ? (
        <Skeleton className="h-52 w-full rounded-lg" />
      ) : (
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={handleMonthChange}
            modifiers={{ hasSessions: sessionDates }}
            locale={DATE_FNS_LOCALES[locale] ?? enUS}
            className="rounded-lg border [--cell-size:--spacing(8)]"
            components={{ DayButton: DayButtonWithDot }}
          />
        </div>
      )}

      {/* Day filter header */}
      {selectedDate && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {format.dateTime(selectedDate, { dateStyle: 'long' })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
            <XIcon data-icon="inline-start" />
            {t('clearDate')}
          </Button>
        </div>
      )}

      {/* Session list — filtered day or full infinite scroll */}
      {selectedDate ? (
        selectedSessions && selectedSessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('dayEmpty')}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <SessionList showTitle={false} />
      )}
    </div>
  )
}
