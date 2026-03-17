'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutExercises,
  createWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  type PaginationParams,
} from '@/lib/api/workout'

export const workoutKeys = {
  all: ['workouts'] as const,
  list: (params: PaginationParams & { program_id?: string }) =>
    [...workoutKeys.all, 'list', params] as const,
  detail: (id: string) => [...workoutKeys.all, 'detail', id] as const,
  exercises: (workout_id: string) => [...workoutKeys.all, 'exercises', workout_id] as const,
}

export function useWorkouts(params: PaginationParams & { program_id?: string } = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: workoutKeys.list(params),
    queryFn: () => getWorkouts(params, locale),
  })
}

export function useWorkout(id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => getWorkoutById(id, locale),
    enabled: !!id,
  })
}

export function useWorkoutExercises(workout_id: string) {
  const locale = useLocale()
  return useQuery({
    queryKey: workoutKeys.exercises(workout_id),
    queryFn: () => getWorkoutExercises(workout_id, locale),
    enabled: !!workout_id,
  })
}

export function useCreateWorkout() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (data: { name: string; day_no: number; program_id: string }) =>
      createWorkout(data, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workoutKeys.all })
      qc.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useUpdateWorkout() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; day_no?: number; program_id?: string }
    }) => updateWorkout(id, data, locale),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: workoutKeys.all })
      qc.invalidateQueries({ queryKey: workoutKeys.detail(id) })
    },
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id, locale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workoutKeys.all })
      qc.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useCreateWorkoutExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (data: {
      position: number
      sets: number
      target_reps: number
      rest_seconds?: number | null
      workout_id: string
      exercise_id: string
    }) => createWorkoutExercise(data, locale),
    onSuccess: (_data, { workout_id }) => {
      qc.invalidateQueries({ queryKey: workoutKeys.exercises(workout_id) })
      qc.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}

export function useUpdateWorkoutExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({
      id,
      workout_id,
      data,
    }: {
      id: string
      workout_id: string
      data: {
        position?: number
        sets?: number
        target_reps?: number
        rest_seconds?: number | null
      }
    }) => updateWorkoutExercise(id, data, locale),
    onSuccess: (_data, { workout_id }) => {
      qc.invalidateQueries({ queryKey: workoutKeys.exercises(workout_id) })
    },
  })
}

export function useDeleteWorkoutExercise() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({ id, workout_id }: { id: string; workout_id: string }) =>
      deleteWorkoutExercise(id, locale),
    onSuccess: (_data, { workout_id }) => {
      qc.invalidateQueries({ queryKey: workoutKeys.exercises(workout_id) })
      qc.invalidateQueries({ queryKey: ['programs'] })
    },
  })
}
