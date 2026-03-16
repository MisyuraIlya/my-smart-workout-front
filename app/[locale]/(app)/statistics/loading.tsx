import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </main>
  )
}
