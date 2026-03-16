'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getSessions,
  getSessionById,
  startTrain,
  finishTrain,
  getSessionSets,
  trackSet,
  type PaginationParams,
} from '@/lib/api/workout'

export const sessionKeys = {
  all: ['sessions'] as const,
  list: (params: object) => [...sessionKeys.all, 'list', params] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
  sets: (session_id: string) => [...sessionKeys.all, 'sets', session_id] as const,
}

export function useSessions(
  params: PaginationParams & {
    status?: 'planned' | 'in_progress' | 'done' | 'skipped'
    from?: string
    to?: string
  } = {},
) {
  const locale = useLocale()
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => getSessions(params, locale),
  })
}

export function useSession(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => getSessionById(id, locale),
    enabled: !!id,
  })
}

export function useSessionSets(session_id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: sessionKeys.sets(session_id),
    queryFn: () => getSessionSets(session_id, locale),
    enabled: !!session_id,
  })
}

export function useStartTrain() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: () => startTrain(locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  })
}

export function useFinishTrain() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => finishTrain(id, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  })
}

export function useTrackSet() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      session_id: string
      data: {
        reps?: number
        rest_seconds?: number
        notes?: string
        weight?: number
        rpe?: number
        is_done?: boolean
      }
    }) => trackSet(id, data, locale),
    onSuccess: (_data, { session_id }) => {
      qc.invalidateQueries({ queryKey: sessionKeys.sets(session_id) })
    },
  })
}
