'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

import type { Exercise } from '@/lib/api/workout'
import { ExerciseForm } from './exercise-form'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  const imgUrl = exerciseImageUrl(exercise)

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      {imgUrl ? (
        <>
          <button
            type="button"
            onClick={() => setImgOpen(true)}
            className="relative size-12 shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image src={imgUrl} alt={exercise.name} fill className="object-cover" unoptimized />
          </button>
          <Dialog open={imgOpen} onOpenChange={setImgOpen}>
            <DialogContent className="max-w-sm p-2">
              <DialogTitle className="sr-only">{exercise.name}</DialogTitle>
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image src={imgUrl} alt={exercise.name} fill className="object-contain" unoptimized />
              </div>
            </DialogContent>
          </Dialog>
        </>
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
                <ExerciseForm
                  exercise={exercise}
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
  )
}
