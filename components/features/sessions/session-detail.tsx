'use client'

import { useTranslations } from 'next-intl'

import { useSession, useSessionSets } from '@/lib/hooks/use-sessions'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planned: 'outline',
  in_progress: 'default',
  done: 'secondary',
  skipped: 'destructive',
}

interface Props {
  sessionId: string
}

export function SessionDetail({ sessionId }: Props) {
  const t = useTranslations('sessions')
  const tt = useTranslations('train')
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { data: setsData, isLoading: setsLoading } = useSessionSets(sessionId)

  if (sessionLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!session) return null

  const sets = setsData?.items ?? []

  // Group sets by exercise
  const grouped = sets.reduce<Record<string, typeof sets>>((acc, set) => {
    const key = set.exercise_id
    if (!acc[key]) acc[key] = []
    acc[key].push(set)
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
        {session.workout && <h1 className="text-2xl font-bold">{session.workout.name}</h1>}
        {session.started_at && (
          <p className="text-sm text-muted-foreground">
            {t('startedAt')}: {new Date(session.started_at).toLocaleString()}
          </p>
        )}
        {session.ended_at && (
          <p className="text-sm text-muted-foreground">
            {t('endedAt')}: {new Date(session.ended_at).toLocaleString()}
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

      {setsLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-18rem)]">
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([exerciseId, exerciseSets]) => {
              const exercise = exerciseSets[0]?.exercise
              return (
                <div key={exerciseId} className="flex flex-col gap-2">
                  <h3 className="font-semibold">
                    {exercise?.name ?? exerciseId}
                  </h3>
                  {exerciseSets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 text-sm"
                    >
                      <span className="w-6 shrink-0 text-center font-medium text-muted-foreground">
                        {set.set_number}
                      </span>
                      <div className="flex flex-1 flex-wrap gap-2">
                        {set.weight != null && (
                          <span>{set.weight} kg</span>
                        )}
                        <span>{set.reps} reps</span>
                        {set.rpe != null && <span>RPE {set.rpe}</span>}
                      </div>
                      {set.is_done && (
                        <Badge variant="secondary" className="shrink-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
