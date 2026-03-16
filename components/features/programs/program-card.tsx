'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Trash2Icon, ChevronRightIcon, CalendarIcon } from 'lucide-react'

import { useGenerateSchedule, useUpdateProgram } from '@/lib/hooks/use-programs'
import type { Program } from '@/lib/api/workout'
import { Link } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
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
    <Button variant="ghost" size="icon" onClick={handleGenerate} disabled={isPending}>
      {isPending ? <Spinner /> : <CalendarIcon />}
      <span className="sr-only">{t('generateSchedule')}</span>
    </Button>
  )
}

interface ProgramCardProps {
  program: Program
  onDelete: (id: string) => void
}

export function ProgramCard({ program, onDelete }: ProgramCardProps) {
  const t = useTranslations('programs')
  const tc = useTranslations('common')

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4">
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
                onClick={() => onDelete(program.id)}
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
  )
}
