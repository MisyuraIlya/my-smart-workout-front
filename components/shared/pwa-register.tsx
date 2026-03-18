'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Service worker registration failed:', err)
        }
      })
    }
  }, [])

  return null
}
