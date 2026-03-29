"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import type { CardioEntry } from "@/lib/api/workout"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

interface CardioActivePanelProps {
  entry: CardioEntry
  elapsedSeconds: number
  onFinish: (values: { caloriesInput: string; distanceInput: string }) => void
  isFinishing: boolean
}

export function CardioActivePanel({
  entry,
  elapsedSeconds,
  onFinish,
  isFinishing,
}: CardioActivePanelProps) {
  const t = useTranslations("cardio")
  const [caloriesInput, setCaloriesInput] = useState(
    entry.calories !== undefined && entry.calories !== null
      ? String(entry.calories)
      : ""
  )
  const [distanceInput, setDistanceInput] = useState(
    entry.distance_km !== undefined && entry.distance_km !== null
      ? String(entry.distance_km)
      : ""
  )

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge>{t(`type.${entry.type}`)}</Badge>
          <span className="text-xs text-muted-foreground">
            {t("activeNow")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 py-2">
          <span className="text-sm text-muted-foreground">{t("timer")}</span>
          <span className="font-mono text-4xl font-bold">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cardio-calories">{t("calories")}</Label>
            <Input
              id="cardio-calories"
              type="number"
              min={0}
              step={0.1}
              value={caloriesInput}
              onChange={(e) => setCaloriesInput(e.target.value)}
              placeholder="220"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cardio-distance">{t("distanceKm")}</Label>
            <Input
              id="cardio-distance"
              type="number"
              min={0}
              step={0.01}
              value={distanceInput}
              onChange={(e) => setDistanceInput(e.target.value)}
              placeholder="4.50"
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          variant="destructive"
          onClick={() => onFinish({ caloriesInput, distanceInput })}
          disabled={isFinishing}
        >
          {isFinishing && <Spinner data-icon="inline-start" />}
          {t("finish")}
        </Button>
      </div>
    </div>
  )
}
