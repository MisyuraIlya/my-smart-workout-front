'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon, SearchIcon } from 'lucide-react'

import { useInfiniteExercises, useDeleteExercise } from '@/lib/hooks/use-exercises'
import { ExerciseForm } from './exercise-form'
import { ExerciseCard } from './exercise-card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export function ExerciseList() {
  const t = useTranslations('exercises')
  const tc = useTranslations('common')
  const [createOpen, setCreateOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [popularity, setPopularity] = useState<number | undefined>(undefined)
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteExercises({ search: search || undefined, popularity })
  const deleteMutation = useDeleteExercise()

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

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Drawer open={createOpen} onOpenChange={setCreateOpen}>
          <DrawerTrigger asChild>
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              {tc('add')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="overflow-y-auto px-4 pb-6">
              <DrawerHeader>
                <DrawerTitle>{t('create')}</DrawerTitle>
              </DrawerHeader>
              <div className="mt-2">
                <ExerciseForm onSuccess={() => setCreateOpen(false)} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={tc('search')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={popularity !== undefined ? String(popularity) : 'all'}
          onValueChange={(v) => setPopularity(v === 'all' ? undefined : Number(v))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('popularityAll')}</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {'★'.repeat(n)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{search ? tc('noResults') : t('empty')}</EmptyTitle>
            {!search && <EmptyDescription>{t('emptyDescription')}</EmptyDescription>}
          </EmptyHeader>
          {!search && (
            <EmptyContent>
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                {t('create')}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} onDelete={handleDelete} />
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
