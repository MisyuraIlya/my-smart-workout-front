"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale } from "next-intl"

import {
  type CardioType,
  type PaginationParams,
  getCardioEntries,
  getActiveCardio,
  startCardio,
  finishCardio,
} from "@/lib/api/workout"

export const cardioKeys = {
  all: ["cardio"] as const,
  list: (params: object) => [...cardioKeys.all, "list", params] as const,
  active: () => [...cardioKeys.all, "active"] as const,
}

export function useCardioHistory(params: PaginationParams = {}) {
  const locale = useLocale()
  return useQuery({
    queryKey: cardioKeys.list(params),
    queryFn: () => getCardioEntries(params, locale),
  })
}

export function useActiveCardio() {
  const locale = useLocale()
  return useQuery({
    queryKey: cardioKeys.active(),
    queryFn: async () => {
      const data = await getActiveCardio(locale)
      return data ?? null
    },
    initialData: null,
    refetchInterval: 15_000,
  })
}

export function useStartCardio() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: (type: CardioType) => startCardio({ type }, locale),
    onSuccess: () => qc.invalidateQueries({ queryKey: cardioKeys.all }),
  })
}

export function useFinishCardio() {
  const qc = useQueryClient()
  const locale = useLocale()
  return useMutation({
    mutationFn: ({
      id,
      calories,
      distance_km,
    }: {
      id: string
      calories?: number
      distance_km?: number
    }) => finishCardio(id, { calories, distance_km }, locale),
    onSuccess: () => {
      qc.setQueryData(cardioKeys.active(), null)
      qc.invalidateQueries({ queryKey: cardioKeys.all })
    },
  })
}
