'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Line, LineChart, XAxis, YAxis } from 'recharts'

import { useExercises } from '@/lib/hooks/use-exercises'
import { useExerciseProgressStatistics } from '@/lib/hooks/use-statistics'
import type { Exercise, ProgressPoint } from '@/lib/api/workout'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

function getLast90Days() {
  const today = new Date()
  const to = today.toISOString().slice(0, 10)
  const from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return { from, to }
}

export function ExerciseProgressChart() {
  const t = useTranslations('statistics')
  const { data: exercises } = useExercises({ limit: 100 })
  const [selectedId, setSelectedId] = useState<string>('')
  const { from, to } = getLast90Days()

  const exerciseId = selectedId || exercises?.items[0]?.id || ''
  const { data, isLoading } = useExerciseProgressStatistics(exerciseId, from, to)

  const chartData = (data?.points ?? []).map((p: ProgressPoint) => ({
    date: p.date.slice(5),
    weight: p.max_weight ?? 0,
  }))

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold shrink-0">{t('exerciseProgress')}</h3>
        <Select
          value={exerciseId}
          onValueChange={setSelectedId}
        >
          <SelectTrigger className="h-8 max-w-40 text-xs">
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

      {data?.summary && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{data.summary.total_sets} sets</Badge>
          <Badge variant="secondary">{data.summary.total_reps} reps</Badge>
          {data.summary.best_weight && (
            <Badge variant="outline">{t('bestWeight')}: {data.summary.best_weight}kg</Badge>
          )}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : chartData.length > 0 ? (
        <ChartContainer
          config={{ weight: { label: 'Max weight (kg)', color: 'var(--chart-2)' } }}
          className="h-32"
        >
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={14} />
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
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">No data yet</p>
      )}
    </div>
  )
}
