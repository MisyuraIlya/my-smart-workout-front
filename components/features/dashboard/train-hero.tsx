'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { DumbbellIcon, TimerIcon } from 'lucide-react'

import { useTrainStore } from '@/lib/stores/train.store'
import { useStartTrain, useFinishTrain } from '@/lib/hooks/use-sessions'
import { useRouter } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TrainHero() {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const router = useRouter()
  const { sessionId, elapsedSeconds, startSession, finishSession } = useTrainStore()
  const startMutation = useStartTrain()
  const finishMutation = useFinishTrain()

  // Timer interval is owned by ActiveSessionBanner in the layout (always mounted).
  // TrainHero just reads elapsedSeconds from the store.

  async function handleStart() {
    try {
      const session = await startMutation.mutateAsync()
      startSession(session.id, session.started_at ?? new Date().toISOString())
      router.push('/train')
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc('error')
      if (msg.includes('404') || msg.includes('no') || msg.includes('planned')) {
        toast.info(t('noSession'))
      } else {
        toast.error(msg)
      }
    }
  }

  async function handleFinish() {
    if (!sessionId) return
    try {
      await finishMutation.mutateAsync(sessionId)
      const id = sessionId
      finishSession()
      toast.success(t('sessionComplete'))
      router.push(`/sessions/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  if (sessionId) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          className="min-h-16 w-full text-lg"
          onClick={() => router.push('/train')}
        >
          <TimerIcon data-icon="inline-start" />
          <span className="font-mono text-2xl">{formatElapsed(elapsedSeconds)}</span>
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="min-h-14 w-full"
          onClick={handleFinish}
          disabled={finishMutation.isPending}
        >
          {finishMutation.isPending && <Spinner data-icon="inline-start" />}
          {t('finishTrain')}
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="lg"
      className="min-h-16 w-full text-lg"
      onClick={handleStart}
      disabled={startMutation.isPending}
    >
      {startMutation.isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <DumbbellIcon data-icon="inline-start" />
      )}
      {t('startTrain')}
    </Button>
  )
}
