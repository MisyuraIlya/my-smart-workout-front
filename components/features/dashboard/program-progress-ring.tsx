'use client'

import { useTranslations } from 'next-intl'
import { RadialBarChart, RadialBar } from 'recharts'
import { Link } from '@/i18n/navigation'
import { PlusCircleIcon } from 'lucide-react'

import { useActiveProgramProgress } from '@/lib/hooks/use-statistics'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function ProgramProgressRing() {
  const t = useTranslations('statistics')
  const { data, isLoading } = useActiveProgramProgress()

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('noActiveProgram')}</EmptyTitle>
            <EmptyDescription>{t('noActiveProgramDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/programs">
                <PlusCircleIcon data-icon="inline-start" />
                Programs
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const percent = Math.round(data.workout_completion_percent)
  const chartData = [{ value: percent, fill: 'var(--chart-1)' }]

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('programProgress')}</h3>
        <Badge variant="outline">{t('daysRemaining', { days: data.remaining_days })}</Badge>
      </div>
      <div className="flex items-center gap-4">
        <ChartContainer
          config={{ value: { label: 'Completion', color: 'var(--chart-1)' } }}
          className="h-28 w-28 shrink-0"
        >
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            data={chartData}
            startAngle={90}
            endAngle={90 - 360 * (percent / 100)}
          >
            <RadialBar dataKey="value" background />
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadialBarChart>
        </ChartContainer>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{percent}%</span>
          <span className="text-sm text-muted-foreground">{data.program_name}</span>
          <span className="text-xs text-muted-foreground">
            {data.completed_workouts} / {data.planned_workouts} workouts
          </span>
        </div>
      </div>
    </div>
  )
}
