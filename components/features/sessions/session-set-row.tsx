'use client'

import type { SessionDataSet } from '@/lib/api/workout'

import { Badge } from '@/components/ui/badge'

interface SessionSetRowProps {
  set: SessionDataSet
}

export function SessionSetRow({ set }: SessionSetRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 text-sm">
      <span className="w-6 shrink-0 text-center font-medium text-muted-foreground">
        {set.set_number}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {set.weight != null && <span>{set.weight} kg</span>}
        <span>{set.reps} reps</span>
        {set.rpe != null && <span>RPE {set.rpe}</span>}
      </div>
      {set.is_done && (
        <Badge variant="secondary" className="shrink-0">
          ✓
        </Badge>
      )}
    </div>
  )
}
