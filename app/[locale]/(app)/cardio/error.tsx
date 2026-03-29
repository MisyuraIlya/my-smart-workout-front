"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function CardioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("errors")
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-12">
      <p className="text-muted-foreground">{t("somethingWentWrong")}</p>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </main>
  )
}
