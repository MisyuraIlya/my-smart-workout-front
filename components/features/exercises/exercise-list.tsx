'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

import { useExercises, useDeleteExercise } from '@/lib/hooks/use-exercises'
import type { Exercise } from '@/lib/api/workout'
import { ExerciseForm } from './exercise-form'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
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

const WORKOUT_API = process.env.NEXT_PUBLIC_WORKOUT_API_URL ?? 'http://localhost:4001/api/v1'

function exerciseImageUrl(exercise: Exercise) {
  if (!exercise.image) return null
  return `${WORKOUT_API}/training/exercises/${exercise.id}/image`
}

export function ExerciseList() {
  const t = useTranslations('exercises')
  const tc = useTranslations('common')
  const { data, isLoading } = useExercises({ limit: 100 })
  const deleteMutation = useDeleteExercise()
  const [editTarget, setEditTarget] = useState<Exercise | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              {tc('add')}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('create')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ExerciseForm onSuccess={() => setCreateOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!data?.items.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('empty')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              {t('create')}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((exercise) => {
            const imgUrl = exerciseImageUrl(exercise)
            return (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
              >
                {imgUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                    <Image src={imgUrl} alt={exercise.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="size-12 shrink-0 rounded-md bg-muted" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{exercise.name}</span>
                  {exercise.difficulty && (
                    <Badge variant="secondary" className="mt-1 w-fit">
                      {t(`difficulty.${exercise.difficulty}`)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Sheet
                    open={editOpen && editTarget?.id === exercise.id}
                    onOpenChange={(open) => {
                      setEditOpen(open)
                      if (!open) setEditTarget(null)
                    }}
                  >
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(exercise)}>
                        <PencilIcon />
                        <span className="sr-only">{tc('edit')}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>{t('edit')}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        {editTarget && (
                          <ExerciseForm
                            exercise={editTarget}
                            onSuccess={() => {
                              setEditOpen(false)
                              setEditTarget(null)
                            }}
                          />
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>

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
                          {tc('delete')} &ldquo;{exercise.name}&rdquo;?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(exercise.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          {tc('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
