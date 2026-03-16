'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import { useMuscles, useDeleteMuscle } from '@/lib/hooks/use-muscles'
import type { Muscle } from '@/lib/api/workout'
import { MuscleForm } from './muscle-form'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
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

export function MuscleList() {
  const t = useTranslations('muscles')
  const tc = useTranslations('common')
  const { data, isLoading } = useMuscles({ limit: 100 })
  const deleteMutation = useDeleteMuscle()
  const [editTarget, setEditTarget] = useState<Muscle | null>(null)
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
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Drawer open={createOpen} onOpenChange={setCreateOpen}>
          <DrawerTrigger asChild>
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              {tc('add')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="overflow-y-auto px-4 pb-6">
              <DrawerHeader>
                <DrawerTitle>{t('create')}</DrawerTitle>
              </DrawerHeader>
              <div className="mt-2">
                <MuscleForm onSuccess={() => setCreateOpen(false)} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
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
          {data.items.map((muscle) => (
            <div
              key={muscle.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <span className="font-medium">{muscle.name}</span>
              <div className="flex items-center gap-2">
                <Drawer
                  open={editOpen && editTarget?.id === muscle.id}
                  onOpenChange={(open) => {
                    setEditOpen(open)
                    if (!open) setEditTarget(null)
                  }}
                >
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(muscle)}
                    >
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
                        {editTarget && (
                          <MuscleForm
                            muscle={editTarget}
                            onSuccess={() => {
                              setEditOpen(false)
                              setEditTarget(null)
                            }}
                          />
                        )}
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
                        onClick={() => handleDelete(muscle.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        {tc('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
