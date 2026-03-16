'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { useMuscles, useDeleteMuscle } from '@/lib/hooks/use-muscles'
import { MuscleForm } from './muscle-form'
import { MuscleCard } from './muscle-card'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export function MuscleList() {
  const t = useTranslations('muscles')
  const tc = useTranslations('common')
  const { data, isLoading } = useMuscles({ limit: 100 })
  const deleteMutation = useDeleteMuscle()
  const [createOpen, setCreateOpen] = useState(false)

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
            <MuscleCard key={muscle.id} muscle={muscle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
