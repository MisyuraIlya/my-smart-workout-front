'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { useTrainStore } from '@/lib/stores/train.store'
import { useSession, useSessionSets, useFinishTrain } from '@/lib/hooks/use-sessions'
import type { WorkoutSessionSet } from '@/lib/api/workout'
import { useRouter } from '@/i18n/navigation'
import { SetRow } from './set-row'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Link } from '@/i18n/navigation'

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TrainView() {
  const t = useTranslations('train')
  const tc = useTranslations('common')
  const router = useRouter()
  const { sessionId, elapsedSeconds, startedAt, tickTimer, finishSession } = useTrainStore()
  const finishMutation = useFinishTrain()

  const { data: session, isLoading: sessionLoading } = useSession(sessionId ?? '')
  const { data: setsData, isLoading: setsLoading } = useSessionSets(sessionId ?? '')

  // Tick timer
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
            <EmptyTitle>No active session</EmptyTitle>
            <EmptyDescription>Start a training session from the dashboard.</EmptyDescription>
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

  const sets = setsData?.items ?? []

  // Group sets by exercise
  const grouped = sets.reduce<
    Record<string, { name: string; targetReps?: number; sets: WorkoutSessionSet[] }>
  >((acc, set: WorkoutSessionSet) => {
    const key = set.exercise_id
    if (!acc[key]) {
      acc[key] = {
        name: set.exercise?.name ?? set.exercise_id,
        targetReps: undefined,
        sets: [],
      }
    }
    acc[key].sets.push(set)
    return acc
  }, {})

  const doneSets = sets.filter((s: WorkoutSessionSet) => s.is_done).length
  const allDone = sets.length > 0 && doneSets === sets.length

  async function handleFinish() {
    if (!sessionId) return
    try {
      await finishMutation.mutateAsync(sessionId)
      const id = sessionId
      finishSession()
      toast.success('Session complete!')
      router.push(`/sessions/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold font-mono">{formatElapsed(elapsedSeconds)}</h1>
          {session && <p className="text-sm text-muted-foreground">{session.workout?.name ?? ''}</p>}
        </div>
        <div className="text-sm text-muted-foreground">
          {t('setsProgress', { done: doneSets, total: sets.length })}
        </div>
      </div>

      <Separator />

      {sessionLoading || setsLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="flex flex-col gap-6 pb-4">
            {Object.entries(grouped).map(([exerciseId, group]) => (
              <div key={exerciseId} className="flex flex-col gap-2">
                <h3 className="font-semibold">{group.name}</h3>
                {group.sets.map((set: WorkoutSessionSet) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    sessionId={sessionId}
                    targetReps={group.targetReps}
                  />
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
