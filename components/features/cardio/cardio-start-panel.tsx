"use client"

import { useTranslations } from "next-intl"

import type { CardioType } from "@/lib/api/workout"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface CardioStartPanelProps {
  type: CardioType
  onTypeChange: (value: CardioType) => void
  onStart: () => void
  isStarting: boolean
}

export function CardioStartPanel({
  type,
  onTypeChange,
  onStart,
  isStarting,
}: CardioStartPanelProps) {
  const t = useTranslations("cardio")

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t("chooseType")}</p>
          <Select
            value={type}
            onValueChange={(value) => onTypeChange(value as CardioType)}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="run">{t("type.run")}</SelectItem>
                <SelectItem value="swim">{t("type.swim")}</SelectItem>
                <SelectItem value="spinning">{t("type.spinning")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={onStart}
          disabled={isStarting}
        >
          {isStarting && <Spinner data-icon="inline-start" />}
          {t("start")}
        </Button>
      </div>
    </div>
  )
}
