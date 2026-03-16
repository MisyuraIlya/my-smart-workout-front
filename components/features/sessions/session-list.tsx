'use client'

import { useTranslations } from 'next-intl'

import { useSessions } from '@/lib/hooks/use-sessions'
import type { WorkoutSession } from '@/lib/api/workout'
import { SessionCard } from './session-card'

import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'

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
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
