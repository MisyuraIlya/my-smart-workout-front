'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from 'recharts'
import { RadialBar, RadialBarChart } from 'recharts'
import { PlusCircleIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'

import { useHoursStatistics, useExerciseProgressStatistics, useActiveProgramProgress } from '@/lib/hooks/use-statistics'
import { useExercises } from '@/lib/hooks/use-exercises'
import type { Exercise, DailyPoint, ProgressPoint } from '@/lib/api/workout'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function StatisticsView() {
  const t = useTranslations('statistics')
  const [hoursFrom, setHoursFrom] = useState(daysAgo(30))
  const [hoursTo, setHoursTo] = useState(today())
  const [exerciseId, setExerciseId] = useState('')
  const [exFrom] = useState(daysAgo(90))
  const [exTo] = useState(today())

  const { data: exercises } = useExercises({ limit: 100 })
  const selectedExId = exerciseId || exercises?.items[0]?.id || ''

  const { data: hours, isLoading: hoursLoading } = useHoursStatistics(hoursFrom, hoursTo)
  const { data: exProgress, isLoading: exLoading } = useExerciseProgressStatistics(
    selectedExId,
    exFrom,
    exTo,
  )
  const { data: programProgress, isLoading: programLoading } = useActiveProgramProgress()

  const hoursData = (hours?.daily ?? []).map((d: DailyPoint) => ({
    date: d.date.slice(5),
    hours: Math.round(d.hours * 10) / 10,
  }))

  const exData = (exProgress?.points ?? []).map((p: ProgressPoint) => ({
    date: p.date.slice(5),
    weight: p.max_weight ?? 0,
  }))

  const programPercent = Math.round(programProgress?.workout_completion_percent ?? 0)

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* Training Hours */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('trainingHours')}</h2>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={hoursFrom}
              onChange={(e) => setHoursFrom(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              value={hoursTo}
              onChange={(e) => setHoursTo(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
        </div>
        {hours && (
          <div className="flex gap-3">
            <Badge variant="secondary">
              {hours.total_hours.toFixed(1)}h {t('totalHours')}
            </Badge>
            <Badge variant="outline">
              {hours.total_sessions} {t('totalSessions')}
            </Badge>
          </div>
        )}
        {hoursLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <div className="rounded-xl border bg-card p-4">
            <ChartContainer
              config={{ hours: { label: t('totalHours'), color: 'var(--chart-1)' } }}
              className="h-48"
            >
              <BarChart data={hoursData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </section>

      <Separator />

      {/* Program Progress */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t('programProgress')}</h2>
        {programLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : !programProgress ? (
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
        ) : (
          <div className="flex items-center gap-6 rounded-xl border bg-card p-4">
            <ChartContainer
              config={{ value: { label: 'Completion', color: 'var(--chart-1)' } }}
              className="h-28 w-28 shrink-0"
            >
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={[{ value: programPercent, fill: 'var(--chart-1)' }]}
                startAngle={90}
                endAngle={90 - 360 * (programPercent / 100)}
              >
                <RadialBar dataKey="value" background />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadialBarChart>
            </ChartContainer>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">{programPercent}%</span>
              <span className="font-medium">{programProgress.program_name}</span>
              <span className="text-sm text-muted-foreground">
                {programProgress.completed_workouts} / {programProgress.planned_workouts} workouts
              </span>
              <Badge variant="outline" className="w-fit">
                {t('daysRemaining', { days: programProgress.remaining_days })}
              </Badge>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Exercise Progress */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold shrink-0">{t('exerciseProgress')}</h2>
          <Select value={selectedExId} onValueChange={setExerciseId}>
            <SelectTrigger className="h-8 max-w-48 text-xs">
              <SelectValue placeholder="Pick exercise" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {exercises?.items.map((ex: Exercise) => (
                  <SelectItem key={ex.id} value={ex.id} className="text-xs">
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {exProgress?.summary && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{exProgress.summary.total_sets} {t('totalSets')}</Badge>
            <Badge variant="secondary">{exProgress.summary.total_reps} {t('totalReps')}</Badge>
            <Badge variant="secondary">{exProgress.summary.total_volume}kg {t('totalVolume')}</Badge>
            {exProgress.summary.best_weight && (
              <Badge variant="outline">
                {t('bestWeight')}: {exProgress.summary.best_weight}kg
              </Badge>
            )}
          </div>
        )}

        {exLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : exData.length > 0 ? (
          <div className="rounded-xl border bg-card p-4">
            <ChartContainer
              config={{ weight: { label: 'Max weight (kg)', color: 'var(--chart-2)' } }}
              className="h-48"
            >
              <LineChart data={exData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={14}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No data yet</p>
        )}
      </section>
    </div>
  )
}
