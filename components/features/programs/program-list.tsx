'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PlusIcon, Trash2Icon, ChevronRightIcon, CalendarIcon } from 'lucide-react'

import { usePrograms, useDeleteProgram, useGenerateSchedule, useUpdateProgram } from '@/lib/hooks/use-programs'
import type { Program } from '@/lib/api/workout'
import { ProgramForm } from './program-form'
import { Link } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
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

const STATUS_LABELS: Record<number, string> = {
  0: 'unknown',
  1: 'active',
  2: 'done',
  3: 'canceled',
  4: 'inactive',
}

const STATUS_VARIANTS: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  0: 'outline',
  1: 'default',
  2: 'secondary',
  3: 'destructive',
  4: 'outline',
}

function ProgramScheduleButton({ program }: { program: Program }) {
  const t = useTranslations('programs')
  const tc = useTranslations('common')
  const generateSchedule = useGenerateSchedule()
  const updateProgram = useUpdateProgram()

  async function handleGenerate(e: React.MouseEvent) {
    e.preventDefault()
    try {
      const result = await generateSchedule.mutateAsync(program.id)
      await updateProgram.mutateAsync({ id: program.id, data: { status: 'active' } })
      toast.success(t('scheduleGenerated', { sessions: result.sessions_created, sets: result.sets_created }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  const isPending = generateSchedule.isPending || updateProgram.isPending

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGenerate}
      disabled={isPending}
    >
      {isPending ? <Spinner /> : <CalendarIcon />}
      <span className="sr-only">{t('generateSchedule')}</span>
    </Button>
  )
}

export function ProgramList() {
  const t = useTranslations('programs')
  const tc = useTranslations('common')
  const { data, isLoading } = usePrograms({ limit: 50 })
  const deleteMutation = useDeleteProgram()
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
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
              {tc('create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('create')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ProgramForm onSuccess={() => setCreateOpen(false)} />
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
          {data.items.map((program) => (
            <div
              key={program.id}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4"
            >
              <Link href={`/programs/${program.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold">{program.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANTS[program.status]}>
                    {t(`status.${STATUS_LABELS[program.status]}`)}
                  </Badge>
                  <Badge variant="outline">{t(`category.${program.category}`)}</Badge>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <ProgramScheduleButton program={program} />
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
                        {tc('delete')} &ldquo;{program.name}&rdquo;?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(program.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        {tc('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
