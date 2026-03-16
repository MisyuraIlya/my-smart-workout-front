import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'

import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/providers'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
