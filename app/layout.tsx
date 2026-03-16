import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'

import './globals.css'
import { cn } from '@/lib/utils'

const fontSans = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'My Smart Workout',
    template: '%s | My Smart Workout',
  },
  description: 'Track your workouts and progress',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
