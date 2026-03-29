'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // In development, disable SW caching to avoid stale frontend bundles.
    if (process.env.NODE_ENV === 'development') {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister()
        })
      })

      if ('caches' in window) {
        void caches.keys().then((keys) => {
          keys.forEach((key) => {
            void caches.delete(key)
          })
        })
      }
      return
    }

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('Service worker registration failed:', err)
    })
  }, [])

  return null
}
