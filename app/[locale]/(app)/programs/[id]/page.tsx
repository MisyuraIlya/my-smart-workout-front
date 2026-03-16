import { ProgramDetail } from '@/components/features/programs/program-detail'

type Props = { params: Promise<{ id: string }> }

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <ProgramDetail programId={id} />
    </main>
  )
}
