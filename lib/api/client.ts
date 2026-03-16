import { useAuthStore } from '@/lib/stores/auth.store'

const WORKOUT_API_URL =
  process.env.NEXT_PUBLIC_WORKOUT_API_URL ?? 'http://localhost:4001/api/v1'
const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:4000/api/v1'

function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  locale: string,
  init?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (res.status === 401) {
    clearAuthAndRedirect()
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string; message?: string }).error ??
        (body as { error?: string; message?: string }).message ??
        'API error',
    )
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export function workoutApiFetch<T>(
  path: string,
  locale: string,
  init?: RequestInit,
): Promise<T> {
  return apiFetch<T>(WORKOUT_API_URL, path, locale, init)
}

export function authApiFetch<T>(
  path: string,
  locale: string,
  init?: RequestInit,
): Promise<T> {
  return apiFetch<T>(AUTH_API_URL, path, locale, init)
}
