'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getMuscles,
  createMuscle,
  updateMuscle,
  deleteMuscle,
  type PaginationParams,
} from '@/lib/api/workout'

export const muscleKeys = {
  all: ['muscles'] as const,
  list: (params: PaginationParams) => [...muscleKeys.all, 'list', params] as const,
  infinite: (params: PaginationParams) => [...muscleKeys.all, 'infinite', params] as const,
}

export function useMuscles(params: PaginationParams = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: muscleKeys.list(params),
    queryFn: () => getMuscles(params, locale),
  })
}

export function useInfiniteMuscles(params: Omit<PaginationParams, 'page'> = {}) {
  const locale = useLocale()
  return useInfiniteQuery({
    queryKey: muscleKeys.infinite(params),
    queryFn: ({ pageParam }) => getMuscles({ ...params, page: pageParam as number }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  })
}

export function useCreateMuscle() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (data: { name: string }) => createMuscle(data, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: muscleKeys.all }),
  })
}

export function useUpdateMuscle() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateMuscle(id, data, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: muscleKeys.all }),
  })
}

export function useDeleteMuscle() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => deleteMuscle(id, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: muscleKeys.all }),
  })
}
