import { authApiFetch } from './client'
import type { Profile } from '@/lib/stores/auth.store'

interface LoginPayload {
  phone: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  profile: Profile
}

export async function loginApi(
  payload: LoginPayload,
  locale: string,
): Promise<LoginResponse> {
  return authApiFetch<LoginResponse>('/profile/auth/login', locale, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
