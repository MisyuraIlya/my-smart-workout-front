'use client'

import { useTranslations } from 'next-intl'
import { ChevronRightIcon } from 'lucide-react'

import type { WorkoutSession } from '@/lib/api/workout'
import { Link } from '@/i18n/navigation'

import { Badge } from '@/components/ui/badge'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planned: 'outline',
  in_progress: 'default',
  done: 'secondary',
  skipped: 'destructive',
}

interface SessionCardProps {
  session: WorkoutSession
}

export function SessionCard({ session }: SessionCardProps) {
  const t = useTranslations('sessions')

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANTS[session.status]}>
            {t(`status.${session.status}`)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {session.scheduled_on}
          </span>
        </div>
        {session.workout && (
          <span className="truncate text-sm font-medium">{session.workout.name}</span>
        )}
        {session.started_at && (
          <span className="text-xs text-muted-foreground">
            {t('startedAt')}: {new Date(session.started_at).toLocaleTimeString()}
          </span>
        )}
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
