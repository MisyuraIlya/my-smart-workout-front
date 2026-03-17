'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { TimerIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { useTrainStore } from '@/lib/stores/train.store'

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ActiveSessionBanner() {
  const t = useTranslations('train')
  const pathname = usePathname()
  const sessionId = useTrainStore((s) => s.sessionId)
  const startedAt = useTrainStore((s) => s.startedAt)
  const elapsedSeconds = useTrainStore((s) => s.elapsedSeconds)
  const tickTimer = useTrainStore((s) => s.tickTimer)

  // Restore elapsed time when banner first mounts with an active session
  useEffect(() => {
    if (startedAt && sessionId) {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      useTrainStore.setState({ elapsedSeconds: Math.max(0, elapsed) })
    }
  }, [startedAt, sessionId])

  // Own the global timer interval — runs regardless of which page is active
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(tickTimer, 1000)
    useTrainStore.setState({ timerInterval: interval })
    return () => clearInterval(interval)
  }, [sessionId, tickTimer])

  if (!sessionId || pathname.includes('/train')) return null

  return (
    <Link
      href="/train"
      className={cn(
        'fixed bottom-16 left-4 right-4 z-40',
        'flex items-center justify-between',
        'rounded-xl bg-primary px-4 py-3 shadow-lg',
        'text-primary-foreground',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
        </span>
        <span className="text-sm font-medium">{t('sessionInProgress')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <TimerIcon className="size-4 shrink-0" />
        <span className="font-mono text-lg font-semibold">{formatElapsed(elapsedSeconds)}</span>
      </div>
    </Link>
  )
}
