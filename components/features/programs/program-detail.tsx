'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon, Trash2Icon, CalendarIcon, PencilIcon } from 'lucide-react'

import { useProgramData, useGenerateSchedule } from '@/lib/hooks/use-programs'
import { useDeleteWorkout, useDeleteWorkoutExercise } from '@/lib/hooks/use-workouts'
import type { ProgramWorkout } from '@/lib/api/workout'
import { WorkoutForm } from './workout-form'
import { WorkoutExerciseForm } from './workout-exercise-form'
import { ProgramForm } from './program-form'
import { WorkoutExerciseItem } from './workout-exercise-item'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

const DAY_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const

interface WorkoutCardProps {
  workout: ProgramWorkout
  programId: string
}

function WorkoutCard({ workout, programId }: WorkoutCardProps) {
  const tc = useTranslations('common')
  const t = useTranslations('workouts')
  const te = useTranslations('exercises')
  const deleteWE = useDeleteWorkoutExercise()
  const deleteWorkout = useDeleteWorkout()
  const [addExOpen, setAddExOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{workout.name}</span>
        <div className="flex items-center gap-1">
          <Drawer open={editOpen} onOpenChange={setEditOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <PencilIcon />
                <span className="sr-only">{tc('edit')}</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="overflow-y-auto px-4 pb-6">
                <DrawerHeader>
                  <DrawerTitle>{t('edit')}</DrawerTitle>
                </DrawerHeader>
                <div className="mt-2">
                  <WorkoutForm
                    programId={programId}
                    dayNo={workout.day_no}
                    workout={{
                      id: workout.id,
                      created_at: workout.created_at,
                      updated_at: workout.updated_at ?? '',
                      name: workout.name,
                      day_no: workout.day_no,
                      program_id: programId,
                    }}
                    onSuccess={() => setEditOpen(false)}
                  />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2Icon />
                <span className="sr-only">{tc('delete')}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{tc('confirm')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {tc('delete')} &ldquo;{workout.name}&rdquo;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteWorkout.mutate(workout.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  {tc('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {workout.exercises.length > 0 && (
        <div className="flex flex-col gap-1">
          {workout.exercises.map((we) => (
            <WorkoutExerciseItem
              key={we.workout_exercise_id}
              we={we}
              onDelete={(id) => deleteWE.mutate({ id, workout_id: workout.id })}
            />
          ))}
        </div>
      )}

      <Drawer open={addExOpen} onOpenChange={setAddExOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="mt-1">
            <PlusIcon data-icon="inline-start" />
            {t('addExercise')}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="overflow-y-auto px-4 pb-6">
            <DrawerHeader>
              <DrawerTitle>{te('name')}</DrawerTitle>
            </DrawerHeader>
            <div className="mt-2">
              <WorkoutExerciseForm
                workoutId={workout.id}
                currentCount={workout.exercises.length}
                onSuccess={() => setAddExOpen(false)}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

interface Props {
  programId: string
}

export function ProgramDetail({ programId }: Props) {
  const t = useTranslations('programs')
  const tw = useTranslations('workouts')
  const tc = useTranslations('common')
  const { data: program, isLoading } = useProgramData(programId)
  const generateSchedule = useGenerateSchedule()
  const [addWorkoutDay, setAddWorkoutDay] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const workouts = program?.workouts ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  if (!program) return null

  async function handleGenerateSchedule() {
    try {
      const result = await generateSchedule.mutateAsync(programId)
      toast.success(
        t('scheduleGenerated', {
          sessions: result.sessions_created,
          sets: result.sets_created,
        }),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-4" />
            <span>
              {program.starts_on.slice(0, 10)} → {program.ends_on.slice(0, 10)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{t(`category.${program.category}`)}</Badge>
          </div>
        </div>
        <Drawer open={editOpen} onOpenChange={setEditOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              <PencilIcon data-icon="inline-start" />
              {tc('edit')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="overflow-y-auto px-4 pb-6">
              <DrawerHeader>
                <DrawerTitle>{t('edit')}</DrawerTitle>
              </DrawerHeader>
              <div className="mt-2">
                <ProgramForm
                  program={program}
                  onSuccess={() => setEditOpen(false)}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t('workouts')}</h2>
        {DAY_KEYS.map((dayKey) => {
          const dayNo = parseInt(dayKey)
          const dayWorkouts = workouts.filter((w) => w.day_no === dayNo)

          return (
            <div key={dayKey} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {tw(`days.${dayKey}`)}
              </span>
              {dayWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} programId={programId} />
              ))}
              <Drawer
                open={addWorkoutDay === dayNo}
                onOpenChange={(open: boolean) => setAddWorkoutDay(open ? dayNo : null)}
              >
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full border-dashed">
                    <PlusIcon data-icon="inline-start" />
                    {t('addWorkout')}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="overflow-y-auto px-4 pb-6">
                    <DrawerHeader>
                      <DrawerTitle>{tw('create')}</DrawerTitle>
                    </DrawerHeader>
                    <div className="mt-2">
                      <WorkoutForm
                        programId={programId}
                        dayNo={dayNo}
                        onSuccess={() => setAddWorkoutDay(null)}
                      />
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-background px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <Button
            size="lg"
            onClick={handleGenerateSchedule}
            disabled={generateSchedule.isPending || workouts.length === 0}
            className="w-full"
          >
            {generateSchedule.isPending && <Spinner data-icon="inline-start" />}
            <CalendarIcon data-icon="inline-start" />
            {t('generateSchedule')}
          </Button>
        </div>
      </div>
    </div>
  )
}
