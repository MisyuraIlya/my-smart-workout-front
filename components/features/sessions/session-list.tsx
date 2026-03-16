'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronRightIcon } from 'lucide-react'

import { useSessions } from '@/lib/hooks/use-sessions'
import type { WorkoutSession } from '@/lib/api/workout'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planned: 'outline',
  in_progress: 'default',
  done: 'secondary',
  skipped: 'destructive',
}

export function SessionList() {
  const t = useTranslations('sessions')
  const { data, isLoading } = useSessions({ limit: 50 })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!data?.items.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="flex flex-col gap-2">
            {data.items.map((session: WorkoutSession) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[session.status]}>
                      {t(`status.${session.status}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {session.scheduled_on}
                    </span>
                  </div>
                  {session.workout && (
                    <span className="truncate text-sm font-medium">{session.workout.name}</span>
                  )}
                  {session.started_at && (
                    <span className="text-xs text-muted-foreground">
                      {t('startedAt')}: {new Date(session.started_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
