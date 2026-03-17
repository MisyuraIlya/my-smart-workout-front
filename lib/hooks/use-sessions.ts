'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getSessions,
  getSessionById,
  getSessionData,
  startTrain,
  finishTrain,
  getSessionSets,
  trackSet,
  type PaginationParams,
} from '@/lib/api/workout'

type SessionListParams = PaginationParams & {
  status?: 'planned' | 'in_progress' | 'done' | 'skipped'
  from?: string
  to?: string
}

export const sessionKeys = {
  all: ['sessions'] as const,
  list: (params: object) => [...sessionKeys.all, 'list', params] as const,
  infinite: (params: object) => [...sessionKeys.all, 'infinite', params] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
  sessionData: (id: string) => [...sessionKeys.all, 'sessionData', id] as const,
  sets: (session_id: string) => [...sessionKeys.all, 'sets', session_id] as const,
}

export function useSessions(params: SessionListParams = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => getSessions(params, locale),
  })
}

export function useInfiniteSessions(params: Omit<SessionListParams, 'page'> = {}) {
  const locale = useLocale()
  return useInfiniteQuery({
    queryKey: sessionKeys.infinite(params),
    queryFn: ({ pageParam }) => getSessions({ ...params, page: pageParam as number }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  })
}

export function useSessionData(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: sessionKeys.sessionData(id),
    queryFn: () => getSessionData(id, locale),
    enabled: !!id,
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
      qc.invalidateQueries({ queryKey: sessionKeys.sessionData(session_id) })
    },
  })
}
