'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
}

export function useMuscles(params: PaginationParams = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: muscleKeys.list(params),
    queryFn: () => getMuscles(params, locale),
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
