'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getPrograms,
  getProgramById,
  getProgramData,
  createProgram,
  updateProgram,
  deleteProgram,
  generateSchedule,
  type ProgramPaginationParams,
} from '@/lib/api/workout'

export const programKeys = {
  all: ['programs'] as const,
  list: (params: ProgramPaginationParams) => [...programKeys.all, 'list', params] as const,
  infinite: (params: ProgramPaginationParams) => [...programKeys.all, 'infinite', params] as const,
  detail: (id: string) => [...programKeys.all, 'detail', id] as const,
  data: (id: string) => [...programKeys.all, 'data', id] as const,
}

export function usePrograms(params: ProgramPaginationParams = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: programKeys.list(params),
    queryFn: () => getPrograms(params, locale),
  })
}

export function useInfinitePrograms(params: Omit<ProgramPaginationParams, 'page'> = {}) {
  const locale = useLocale()
  return useInfiniteQuery({
    queryKey: programKeys.infinite(params),
    queryFn: ({ pageParam }) => getPrograms({ ...params, page: pageParam as number }, locale),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
  })
}

export function useProgram(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getProgramById(id, locale),
    enabled: !!id,
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (data: {
      name: string
      status: 'active' | 'done' | 'canceled' | 'inactive'
      category: 'strength' | 'mass' | 'cardio'
      starts_on: string
      ends_on: string
    }) => createProgram(data, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: programKeys.all }),
  })
}

export function useUpdateProgram() {
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
        status?: 'active' | 'done' | 'canceled' | 'inactive'
        category?: 'strength' | 'mass' | 'cardio'
        starts_on?: string
        ends_on?: string
      }
    }) => updateProgram(id, data, locale),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: programKeys.all })
      qc.invalidateQueries({ queryKey: programKeys.detail(id) })
    },
  })
}

export function useDeleteProgram() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: programKeys.all }),
  })
}

export function useProgramData(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: programKeys.data(id),
    queryFn: () => getProgramData(id, locale),
    enabled: !!id,
  })
}

export function useGenerateSchedule() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => generateSchedule(id, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
