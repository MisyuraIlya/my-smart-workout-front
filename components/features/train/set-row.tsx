'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useTrackSet } from '@/lib/hooks/use-sessions'
import type { WorkoutSessionSet } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface Props {
  set: WorkoutSessionSet
  sessionId: string
  targetReps?: number
}

const RPE_VALUES = ['6', '7', '8', '9', '10']

export function SetRow({ set, sessionId, targetReps }: Props) {
  const t = useTranslations('train')
  const trackSet = useTrackSet()
  const [weight, setWeight] = useState(set.weight?.toString() ?? '')
  const [reps, setReps] = useState(set.reps?.toString() ?? targetReps?.toString() ?? '')
  const [rpe, setRpe] = useState(set.rpe?.toString() ?? '')
  const [isDone, setIsDone] = useState(set.is_done)

  async function handleDone() {
    const newDone = !isDone
    setIsDone(newDone)
    try {
      await trackSet.mutateAsync({
        id: set.id,
        session_id: sessionId,
        data: {
          is_done: newDone,
          reps: reps ? parseInt(reps) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          rpe: rpe ? parseInt(rpe) : undefined,
        },
      })
    } catch {
      setIsDone(!newDone)
    }
  }

  async function handleBlurSave() {
    if (!isDone) return
    try {
      await trackSet.mutateAsync({
        id: set.id,
        session_id: sessionId,
        data: {
          is_done: isDone,
          reps: reps ? parseInt(reps) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          rpe: rpe ? parseInt(rpe) : undefined,
        },
      })
    } catch {
      // silent
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-14 flex-col gap-2 rounded-lg border bg-card p-3 transition-colors',
        isDone && 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="size-8 shrink-0 justify-center font-mono">
          {set.set_number}
        </Badge>
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            placeholder={t('weight')}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={handleBlurSave}
            className="h-9 text-center"
          />
          <span className="shrink-0 text-xs text-muted-foreground">kg</span>
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={targetReps ? String(targetReps) : t('reps')}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onBlur={handleBlurSave}
            className="h-9 text-center"
          />
          <span className="shrink-0 text-xs text-muted-foreground">reps</span>
        </div>
        <Button
          variant={isDone ? 'default' : 'outline'}
          size="icon"
          className="size-10 shrink-0"
          onClick={handleDone}
          disabled={trackSet.isPending}
        >
          <CheckIcon />
          <span className="sr-only">{t('done')}</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{t('rpe')}:</span>
        <ToggleGroup
          type="single"
          value={rpe}
          onValueChange={(v) => setRpe(v)}
          className="gap-1"
        >
          {RPE_VALUES.map((v) => (
            <ToggleGroupItem key={v} value={v} className="size-7 text-xs">
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
