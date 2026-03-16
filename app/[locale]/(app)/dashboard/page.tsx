import { TrainHero } from '@/components/features/dashboard/train-hero'
import { UpcomingSessions } from '@/components/features/dashboard/upcoming-sessions'
import { HoursChart } from '@/components/features/dashboard/hours-chart'
import { ProgramProgressRing } from '@/components/features/dashboard/program-progress-ring'
import { ExerciseProgressChart } from '@/components/features/dashboard/exercise-progress-chart'

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <div className="flex flex-col gap-6">
        <TrainHero />
        <UpcomingSessions />
        <HoursChart />
        <ProgramProgressRing />
        <ExerciseProgressChart />
      </div>
    </main>
  )
}
