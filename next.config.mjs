import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const storageUrl = new URL(process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:9000')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: /** @type {'http'|'https'} */ (storageUrl.protocol.replace(':', '')),
        hostname: storageUrl.hostname,
        port: storageUrl.port,
      },
    ],
  },
}

export default withNextIntl(nextConfig)
