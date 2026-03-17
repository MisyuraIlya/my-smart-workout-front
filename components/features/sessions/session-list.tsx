'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'

import { useInfiniteSessions } from '@/lib/hooks/use-sessions'
import { SessionCard } from './session-card'

import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export function SessionList({ showTitle = true }: { showTitle?: boolean }) {
  const t = useTranslations('sessions')
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteSessions({ limit: 20 })

  const items = data?.pages.flatMap((p) => p.items) ?? []

  const hasNextPageRef = useRef(hasNextPage)
  const fetchNextPageRef = useRef(fetchNextPage)
  const fetchingRef = useRef(false)
  hasNextPageRef.current = hasNextPage
  fetchNextPageRef.current = fetchNextPage
  useEffect(() => { if (!isFetchingNextPage) fetchingRef.current = false }, [isFetchingNextPage])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null }
    if (!el) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPageRef.current && !fetchingRef.current) {
          fetchingRef.current = true
          fetchNextPageRef.current()
        }
      },
      { threshold: 0.1 },
    )
    observerRef.current.observe(el)
  }, [])

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
      {showTitle && <h1 className="text-2xl font-bold">{t('title')}</h1>}

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
