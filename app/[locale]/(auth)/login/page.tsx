import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { LoginForm } from '@/components/features/auth/login-form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')
  return { title: t('login') }
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
