'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  type PaginationParams,
} from '@/lib/api/workout'

export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (params: PaginationParams & { muscle_id?: string }) =>
    [...exerciseKeys.all, 'list', params] as const,
  infinite: (params: PaginationParams & { muscle_id?: string }) =>
    [...exerciseKeys.all, 'infinite', params] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
}

export function useExercises(params: PaginationParams & { muscle_id?: string } = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: exerciseKeys.list(params),
    queryFn: () => getExercises(params, locale),
  })
}

export function useInfiniteExercises(params: Omit<PaginationParams, 'page'> & { muscle_id?: string } = {}) {
  const locale = useLocale()
  return useInfiniteQuery({
    queryKey: exerciseKeys.infinite(params),
    queryFn: ({ pageParam }) => getExercises({ ...params, page: pageParam as number }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  })
}

export function useExercise(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => getExerciseById(id, locale),
    enabled: !!id,
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      instructions?: string[]
      muscle_id: string
      difficulty?: 'beginner' | 'intermediate' | 'advanced'
    }) => createExercise(data, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: exerciseKeys.all }),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        name?: string
        description?: string
        instructions?: string[]
        muscle_id?: string
        difficulty?: 'beginner' | 'intermediate' | 'advanced'
      }
    }) => updateExercise(id, data, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: exerciseKeys.all }),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: exerciseKeys.all }),
  })
}
