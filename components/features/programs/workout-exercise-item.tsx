'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Trash2Icon } from 'lucide-react'

import type { ProgramWorkoutExercise } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:9000'

interface WorkoutExerciseItemProps {
  we: ProgramWorkoutExercise
  onDelete: (workoutExerciseId: string) => void
}

export function WorkoutExerciseItem({ we, onDelete }: WorkoutExerciseItemProps) {
  const tc = useTranslations('common')
  const te = useTranslations('exercises')

  const imgUrl = we.image
    ? `${STORAGE_URL}/${we.image.bucket_name}/${we.image.storage_key}`
    : null

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
      {imgUrl ? (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
          <Image src={imgUrl} alt={we.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="size-10 shrink-0 rounded-md bg-muted" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{we.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{we.sets}×{we.target_reps}</span>
          {we.difficulty && (
            <Badge variant="secondary" className="h-4 px-1 text-xs">
              {te(`difficulty.${we.difficulty}`)}
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={() => onDelete(we.workout_exercise_id)}
      >
        <Trash2Icon />
        <span className="sr-only">{tc('remove')}</span>
      </Button>
    </div>
  )
}
