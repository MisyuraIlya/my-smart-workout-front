FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_WORKOUT_API_URL
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_STORAGE_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_WORKOUT_API_URL=${NEXT_PUBLIC_WORKOUT_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_STORAGE_URL=${NEXT_PUBLIC_STORAGE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$NEXT_PUBLIC_WORKOUT_API_URL" \
  && test -n "$NEXT_PUBLIC_AUTH_API_URL" \
  && test -n "$NEXT_PUBLIC_STORAGE_URL"
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
