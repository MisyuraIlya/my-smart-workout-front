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
  _hasHydrated: boolean
  token: string | null
  profile: Profile | null
  setAuth: (token: string, profile: Profile) => void
  clearAuth: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      token: null,
      profile: null,
      setAuth: (token, profile) => set({ token, profile }),
      clearAuth: () => set({ token: null, profile: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
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
