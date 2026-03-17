'use client'

import { useTranslations, useFormatter } from 'next-intl'

import { useSessionData } from '@/lib/hooks/use-sessions'
import type { SessionDataSet } from '@/lib/api/workout'
import { SessionSetRow } from './session-set-row'
import { ClickableExerciseImage } from '@/components/shared/clickable-exercise-image'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:9000'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planned: 'outline',
  in_progress: 'default',
  done: 'secondary',
  skipped: 'destructive',
}

interface ExerciseGroup {
  name: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  imageUrl?: string
  sets: SessionDataSet[]
}

interface Props {
  sessionId: string
}

export function SessionDetail({ sessionId }: Props) {
  const t = useTranslations('sessions')
  const te = useTranslations('exercises')
  const tt = useTranslations('train')
  const format = useFormatter()
  const { data: session, isLoading } = useSessionData(sessionId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!session) return null

  const sets = session.sets

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANTS[session.status]}>
            {t(`status.${session.status}`)}
          </Badge>
          <span className="text-sm text-muted-foreground">{session.scheduled_on}</span>
        </div>
        {session.started_at && (
          <p className="text-sm text-muted-foreground">
            {t('startedAt')}:{' '}
            {format.dateTime(new Date(session.started_at), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
        {session.ended_at && (
          <p className="text-sm text-muted-foreground">
            {t('endedAt')}:{' '}
            {format.dateTime(new Date(session.ended_at), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
        {session.notes && (
          <p className="text-sm text-muted-foreground">{session.notes}</p>
        )}
      </div>

      {sets.length > 0 && (
        <>
          <div className="text-sm font-medium text-muted-foreground">
            {tt('setsProgress', { done: doneSets, total: sets.length })}
          </div>
          <Separator />
        </>
      )}

      <div className="flex flex-col gap-6">
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
              <SessionSetRow key={set.id} set={set} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
