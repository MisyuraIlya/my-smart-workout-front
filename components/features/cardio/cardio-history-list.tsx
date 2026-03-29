"use client"

import { useTranslations } from "next-intl"

import type { CardioEntry } from "@/lib/api/workout"
import { CardioEntryCard } from "./cardio-entry-card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

interface CardioHistoryListProps {
  items: CardioEntry[]
  isLoading: boolean
}

export function CardioHistoryList({
  items,
  isLoading,
}: CardioHistoryListProps) {
  const t = useTranslations("cardio")

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((entry) => (
        <CardioEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
