'use client'

import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getHoursStatistics,
  getExerciseProgressStatistics,
  getProgramProgressStatistics,
  type Program,
} from '@/lib/api/workout'
import { usePrograms } from './use-programs'

export const statisticsKeys = {
  all: ['statistics'] as const,
  hours: (from: string, to: string) => [...statisticsKeys.all, 'hours', from, to] as const,
  exerciseProgress: (id: string, from: string, to: string) =>
    [...statisticsKeys.all, 'exercise-progress', id, from, to] as const,
  programProgress: (id: string) => [...statisticsKeys.all, 'program-progress', id] as const,
}

export function useHoursStatistics(from: string, to: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: statisticsKeys.hours(from, to),
    queryFn: () => getHoursStatistics(from, to, locale),
    enabled: !!from && !!to,
  })
}

export function useExerciseProgressStatistics(exerciseId: string, from: string, to: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: statisticsKeys.exerciseProgress(exerciseId, from, to),
    queryFn: () => getExerciseProgressStatistics(exerciseId, from, to, locale),
    enabled: !!exerciseId && !!from && !!to,
  })
}

export function useProgramProgressStatistics(programId: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: statisticsKeys.programProgress(programId),
    queryFn: () => getProgramProgressStatistics(programId, locale),
    enabled: !!programId,
  })
}

export function useActiveProgramProgress() {
  const { data: programs } = usePrograms({ limit: 50 })
  const activeProgram = programs?.items.find((p: Program) => p.status === 1)
  return useProgramProgressStatistics(activeProgram?.id ?? '')
}
