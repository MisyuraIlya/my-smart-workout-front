'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useRouter } from '@/i18n/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.replace('/login')
    }
  }, [token, router])

  if (!token) return null

  return <>{children}</>
}
