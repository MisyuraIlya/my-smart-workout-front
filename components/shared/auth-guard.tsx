'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useRouter } from '@/i18n/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace('/login')
    }
  }, [hasHydrated, token, router])

  if (!hasHydrated) return null
  if (!token) return null

  return <>{children}</>
}
