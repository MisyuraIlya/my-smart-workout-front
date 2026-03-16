import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Profile {
  id: string
  phone: string
  name?: string
  created_at?: string
  updated_at?: string
}

interface AuthState {
  token: string | null
  profile: Profile | null
  setAuth: (token: string, profile: Profile) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      profile: null,
      setAuth: (token, profile) => set({ token, profile }),
      clearAuth: () => set({ token: null, profile: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return window.localStorage
      }),
    },
  ),
)
