'use client'

import { useTranslations } from 'next-intl'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { useHoursStatistics } from '@/lib/hooks/use-statistics'
import type { DailyPoint } from '@/lib/api/workout'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

function getLast30Days() {
  const today = new Date()
  const to = today.toISOString().slice(0, 10)
  const from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return { from, to }
}

export function HoursChart() {
  const t = useTranslations('statistics')
  const { from, to } = getLast30Days()
  const { data, isLoading } = useHoursStatistics(from, to)

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />
  }

  const chartData = (data?.daily ?? []).map((d: DailyPoint) => ({
    date: d.date.slice(5), // MM-DD
    hours: Math.round(d.hours * 10) / 10,
  }))

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('trainingHours')}</h3>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {data?.total_hours.toFixed(1)}h
          </Badge>
          <Badge variant="outline">
            {data?.total_sessions} {t('totalSessions')}
          </Badge>
        </div>
      </div>
      <ChartContainer
        config={{ hours: { label: t('totalHours'), color: 'var(--chart-1)' } }}
        className="h-36"
      >
        <BarChart data={chartData}>
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
  )
}
