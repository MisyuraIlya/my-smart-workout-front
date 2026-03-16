import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  return intlMiddleware(request)
}

export const config = {
  // Exclude: API routes, _next internals, and any path with a file extension
  // The ".*\\..*" part catches locale-prefixed _next paths like /en/_next/static/foo.js
  matcher: ['/((?!api|_next|.*\\..*).*)', ],
}
