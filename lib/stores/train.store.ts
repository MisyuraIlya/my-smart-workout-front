import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TrainState {
  sessionId: string | null
  startedAt: string | null
  elapsedSeconds: number
  timerInterval: ReturnType<typeof setInterval> | null
  startSession: (sessionId: string, startedAt: string) => void
  finishSession: () => void
  tickTimer: () => void
}

export const useTrainStore = create<TrainState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      startedAt: null,
      elapsedSeconds: 0,
      timerInterval: null,
      startSession: (sessionId, startedAt) => {
        const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        set({ sessionId, startedAt, elapsedSeconds: Math.max(0, elapsed) })
      },
      finishSession: () => {
        const { timerInterval } = get()
        if (timerInterval) clearInterval(timerInterval)
        set({ sessionId: null, startedAt: null, elapsedSeconds: 0, timerInterval: null })
      },
      tickTimer: () => {
        set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }))
      },
    }),
    {
      name: 'train-storage',
      partialize: (state) => ({ sessionId: state.sessionId, startedAt: state.startedAt }),
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
        return window.localStorage
      }),
    },
  ),
)
