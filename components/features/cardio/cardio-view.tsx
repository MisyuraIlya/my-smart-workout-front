"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { CardioType } from "@/lib/api/workout"
import {
  cardioKeys,
  useActiveCardio,
  useCardioHistory,
  useFinishCardio,
  useStartCardio,
} from "@/lib/hooks/use-cardio"

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CardioStartPanel } from "./cardio-start-panel"
import { CardioActivePanel } from "./cardio-active-panel"
import { CardioHistoryList } from "./cardio-history-list"

function parseOptionalMetric(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === "") return undefined

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("invalid_metric")
  }

  return parsed
}

function elapsedFrom(startedAt: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  )
}

export function CardioView() {
  const t = useTranslations("cardio")
  const queryClient = useQueryClient()

  const [selectedType, setSelectedType] = useState<CardioType>("run")
  const [, setTick] = useState(0)

  const { data: activeCardio, isLoading: activeLoading } = useActiveCardio()
  const { data: history, isLoading: historyLoading } = useCardioHistory({
    page: 1,
    limit: 20,
  })

  const startMutation = useStartCardio()
  const finishMutation = useFinishCardio()

  useEffect(() => {
    if (!activeCardio?.started_at) return
    const interval = setInterval(() => {
      setTick((value) => value + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [activeCardio?.id, activeCardio?.started_at])

  const elapsedSeconds = activeCardio?.started_at
    ? elapsedFrom(activeCardio.started_at)
    : 0

  async function handleStart() {
    try {
      await startMutation.mutateAsync(selectedType)
      toast.success(t("started"))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("startFailed"))
    }
  }

  async function handleFinish({
    caloriesInput,
    distanceInput,
  }: {
    caloriesInput: string
    distanceInput: string
  }) {
    if (!activeCardio) return

    try {
      const calories = parseOptionalMetric(caloriesInput)
      const distance_km = parseOptionalMetric(distanceInput)

      await finishMutation.mutateAsync({
        id: activeCardio.id,
        calories,
        distance_km,
      })
      queryClient.setQueryData(cardioKeys.active(), null)
      toast.success(t("finished"))
    } catch (err) {
      if (err instanceof Error && err.message === "invalid_metric") {
        toast.error(t("invalidMetric"))
        return
      }

      toast.error(err instanceof Error ? err.message : t("finishFailed"))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {activeLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : activeCardio ? (
        <CardioActivePanel
          key={activeCardio.id}
          entry={activeCardio}
          elapsedSeconds={elapsedSeconds}
          onFinish={handleFinish}
          isFinishing={finishMutation.isPending}
        />
      ) : (
        <CardioStartPanel
          type={selectedType}
          onTypeChange={setSelectedType}
          onStart={handleStart}
          isStarting={startMutation.isPending}
        />
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t("history")}</h2>
        <CardioHistoryList
          items={history?.items ?? []}
          isLoading={historyLoading}
        />
      </div>
    </div>
  )
}
