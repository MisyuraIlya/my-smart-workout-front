'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PencilIcon, Trash2Icon } from 'lucide-react'

import type { Muscle } from '@/lib/api/workout'
import { MuscleForm } from './muscle-form'

import { Button } from '@/components/ui/button'
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

interface MuscleCardProps {
  muscle: Muscle
  onDelete: (id: string) => void
}

export function MuscleCard({ muscle, onDelete }: MuscleCardProps) {
  const t = useTranslations('muscles')
  const tc = useTranslations('common')
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
      <span className="font-medium">{muscle.name}</span>
      <div className="flex items-center gap-2">
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
                <MuscleForm
                  muscle={muscle}
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
                {tc('delete')} &ldquo;{muscle.name}&rdquo;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(muscle.id)}
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
