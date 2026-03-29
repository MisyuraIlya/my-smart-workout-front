"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Clock3Icon, FlameIcon, MapPinIcon } from "lucide-react"

import type { CardioEntry } from "@/lib/api/workout"
import { Badge } from "@/components/ui/badge"

function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds)
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60

  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function CardioEntryCard({ entry }: { entry: CardioEntry }) {
  const t = useTranslations("cardio")
  const format = useFormatter()

  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="secondary">{t(`type.${entry.type}`)}</Badge>
        <span className="font-mono text-sm text-muted-foreground">
          {formatDuration(entry.duration_seconds)}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock3Icon className="size-4 shrink-0" />
          <span>
            {t("startedAt")}:{" "}
            {format.dateTime(new Date(entry.started_at), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        {entry.calories !== undefined && entry.calories !== null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FlameIcon className="size-4 shrink-0" />
            <span>
              {entry.calories.toFixed(1)} {t("kcal")}
            </span>
          </div>
        )}

        {entry.distance_km !== undefined && entry.distance_km !== null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            <span>
              {entry.distance_km.toFixed(2)} {t("km")}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
