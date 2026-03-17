'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { useTrainStore } from '@/lib/stores/train.store'
import { useSessionData, useFinishTrain } from '@/lib/hooks/use-sessions'
import type { SessionDataSet } from '@/lib/api/workout'
import { useRouter, Link } from '@/i18n/navigation'
import { SetRow } from './set-row'
import { ClickableExerciseImage } from '@/components/shared/clickable-exercise-image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:9000'

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface ExerciseGroup {
  name: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  imageUrl?: string
  sets: SessionDataSet[]
}

export function TrainView() {
  const t = useTranslations('train')
  const te = useTranslations('exercises')
  const tc = useTranslations('common')
  const router = useRouter()
  const { sessionId, elapsedSeconds, startedAt, tickTimer, finishSession } = useTrainStore()
  const finishMutation = useFinishTrain()

  const { data: sessionData, isLoading } = useSessionData(sessionId ?? '')

  // Sync + tick timer
  useEffect(() => {
    if (!sessionId) return
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      useTrainStore.setState({ elapsedSeconds: Math.max(0, elapsed) })
    }
    const interval = setInterval(tickTimer, 1000)
    return () => clearInterval(interval)
  }, [sessionId, startedAt, tickTimer])

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('noActiveSession')}</EmptyTitle>
            <EmptyDescription>{t('noActiveSessionDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard">{tc('back')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const sets = sessionData?.sets ?? []

  const grouped = sets.reduce<Record<string, ExerciseGroup>>((acc, set) => {
    if (!acc[set.exercise_id]) {
      acc[set.exercise_id] = {
        name: set.exercise_name,
        difficulty: set.exercise_difficulty,
        imageUrl: set.image
          ? `${STORAGE_URL}/${set.image.bucket_name}/${set.image.storage_key}`
          : undefined,
        sets: [],
      }
    }
    acc[set.exercise_id].sets.push(set)
    return acc
  }, {})

  const doneSets = sets.filter((s) => s.is_done).length
  const totalSets = sets.length
  const allDone = totalSets > 0 && doneSets === totalSets

  async function handleFinish() {
    if (!sessionId) return
    try {
      await finishMutation.mutateAsync(sessionId)
      const id = sessionId
      finishSession()
      toast.success(t('sessionComplete'))
      router.push(`/sessions/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold font-mono">{formatElapsed(elapsedSeconds)}</h1>
          {sessionData && (
            <p className="text-sm text-muted-foreground">{sessionData.scheduled_on}</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {t('setsProgress', { done: doneSets, total: totalSets })}
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-6 pb-28">
            {Object.entries(grouped).map(([exerciseId, group]) => (
              <div key={exerciseId} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {group.imageUrl ? (
                    <ClickableExerciseImage src={group.imageUrl} alt={group.name} />
                  ) : (
                    <div className="size-12 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold leading-tight">{group.name}</h3>
                    {group.difficulty && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        {te(`difficulty.${group.difficulty}`)}
                      </Badge>
                    )}
                  </div>
                </div>
                {group.sets.map((set) => (
                  <SetRow key={set.id} set={set} sessionId={sessionId} />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-2xl px-4">
        <Button
          size="lg"
          className="w-full"
          variant={allDone ? 'default' : 'outline'}
          onClick={handleFinish}
          disabled={finishMutation.isPending}
        >
          {finishMutation.isPending && <Spinner data-icon="inline-start" />}
          {t('finish')}
        </Button>
      </div>
    </div>
  )
}
