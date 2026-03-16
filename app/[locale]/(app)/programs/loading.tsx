import { Skeleton } from '@/components/ui/skeleton'

export default function ProgramsLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </main>
  )
}
