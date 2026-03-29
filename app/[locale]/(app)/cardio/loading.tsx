import { Skeleton } from "@/components/ui/skeleton"

export default function CardioLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </main>
  )
}
