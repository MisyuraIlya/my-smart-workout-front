import { Skeleton } from '@/components/ui/skeleton'

export default function TrainLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-36" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </main>
  )
}
