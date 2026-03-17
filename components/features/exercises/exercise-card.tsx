'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

import type { Exercise } from '@/lib/api/workout'
import { ExerciseForm } from './exercise-form'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:9000'

function exerciseImageUrl(exercise: Exercise) {
  if (!exercise.image) return null
  return `${STORAGE_URL}/${exercise.image.bucket_name}/${exercise.image.storage_key}`
}

interface ExerciseCardProps {
  exercise: Exercise
  onDelete: (id: string) => void
}

export function ExerciseCard({ exercise, onDelete }: ExerciseCardProps) {
  const t = useTranslations('exercises')
  const tc = useTranslations('common')
  const [editOpen, setEditOpen] = useState(false)
  const [imgOpen, setImgOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const imgUrl = exerciseImageUrl(exercise)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setDetailOpen(true)}
        className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-4 py-3"
      >
        {imgUrl ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setImgOpen(true) }}
            className="relative size-12 shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image src={imgUrl} alt={exercise.name} fill className="object-cover" unoptimized />
          </button>
        ) : (
          <div className="size-12 shrink-0 rounded-md bg-muted" />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{exercise.name}</span>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {exercise.difficulty && (
              <Badge variant="secondary" className="w-fit">
                {t(`difficulty.${exercise.difficulty}`)}
              </Badge>
            )}
            {exercise.popularity && (
              <span className="text-xs text-muted-foreground">
                {'★'.repeat(exercise.popularity)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Drawer open={editOpen} onOpenChange={setEditOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
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
                  <ExerciseForm exercise={exercise} onSuccess={() => setEditOpen(false)} />
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
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
                  onClick={() => onDelete(exercise.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  {tc('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Image fullscreen — outside card to avoid nested interactive elements */}
      {imgUrl && (
        <Dialog open={imgOpen} onOpenChange={setImgOpen}>
          <DialogContent className="max-w-sm p-2">
            <DialogTitle className="sr-only">{exercise.name}</DialogTitle>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={imgUrl} alt={exercise.name} fill className="object-contain" unoptimized />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Read-only detail drawer */}
      <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
        <DrawerContent>
          <div className="overflow-y-auto px-4 pb-6">
            <DrawerHeader>
              <DrawerTitle>{exercise.name}</DrawerTitle>
            </DrawerHeader>
            <div className="mt-2 flex flex-col gap-4">
              {imgUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image src={imgUrl} alt={exercise.name} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {exercise.difficulty && (
                  <Badge variant="secondary">{t(`difficulty.${exercise.difficulty}`)}</Badge>
                )}
                {exercise.popularity && (
                  <Badge variant="outline">{'★'.repeat(exercise.popularity)}</Badge>
                )}
              </div>
              {exercise.description && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">{t('description')}</span>
                  <p className="text-sm">{exercise.description}</p>
                </div>
              )}
              {exercise.instructions?.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('instructions')}</span>
                    <ol className="flex flex-col gap-1.5">
                      {exercise.instructions.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="shrink-0 font-medium text-muted-foreground">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
