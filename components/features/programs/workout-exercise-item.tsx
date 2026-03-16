'use client'

import { useTranslations } from 'next-intl'
import { Trash2Icon } from 'lucide-react'

import type { WorkoutExercise } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'

interface WorkoutExerciseItemProps {
  we: WorkoutExercise
  onDelete: (id: string, workoutId: string) => void
}

export function WorkoutExerciseItem({ we, onDelete }: WorkoutExerciseItemProps) {
  const tc = useTranslations('common')

  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
      <span>{we.exercise?.name ?? we.exercise_id}</span>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{we.sets}×{we.target_reps}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => onDelete(we.id, we.workout_id)}
        >
          <Trash2Icon className="size-3" />
          <span className="sr-only">{tc('remove')}</span>
        </Button>
      </div>
    </div>
  )
}
