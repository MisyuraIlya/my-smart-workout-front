import { SessionDetail } from '@/components/features/sessions/session-detail'

type Props = { params: Promise<{ id: string }> }

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <SessionDetail sessionId={id} />
    </main>
  )
}
