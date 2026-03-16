# Progress

## Status: All features complete

---

## Done

### Foundation
- [x] `npx create-next-app` scaffold with TypeScript + Tailwind v4
- [x] shadcn/ui init
- [x] Install core deps: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `next-intl` (recharts bundled via shadcn `chart` component)
- [x] `next.config.mjs` — `output: 'standalone'`, next-intl plugin, `images.remotePatterns` for workout API (localhost:4001)
- [x] `i18n/routing.ts` + `proxy.ts` for locale routing (en, ru, he) — Next.js 16+ uses `proxy.ts`, not `middleware.ts`
- [x] Message files `messages/en.json`, `messages/ru.json`, `messages/he.json`
- [x] Base API client `lib/api/client.ts` (Accept-Language + Bearer token + 401 handler)
- [x] `app/[locale]/layout.tsx` — locale-aware root layout with NextIntlClientProvider, ThemeProvider, QueryClientProvider
- [x] `app/global-error.tsx` — root error boundary (must render `<html><body>`, must be `'use client'`)
- [x] `app/[locale]/error.tsx` — route-level error boundary (`'use client'`)
- [x] `app/[locale]/not-found.tsx` — 404 page
- [x] `app/[locale]/loading.tsx` — root loading state
- [x] `app/api/health/route.ts` — health check endpoint for Docker
- [x] Zustand auth store `lib/stores/auth.store.ts` + localStorage persistence

### Auth
- [x] Login page `/[locale]/login` — phone + password form

### API Layer
- [x] `lib/api/workout.ts` — all CRUD + session + statistics API functions + TypeScript types

### State
- [x] `lib/stores/train.store.ts` — active session state (sessionId, startedAt, elapsedSeconds, timer)

### Validations
- [x] `lib/validations/muscle.schema.ts`
- [x] `lib/validations/exercise.schema.ts`
- [x] `lib/validations/program.schema.ts`
- [x] `lib/validations/workout.schema.ts`
- [x] `lib/validations/workout-exercise.schema.ts`
- [x] `lib/validations/session-set.schema.ts`

### React Query Hooks
- [x] `lib/hooks/use-muscles.ts`
- [x] `lib/hooks/use-exercises.ts`
- [x] `lib/hooks/use-programs.ts`
- [x] `lib/hooks/use-workouts.ts`
- [x] `lib/hooks/use-sessions.ts`
- [x] `lib/hooks/use-statistics.ts`

### Muscles
- [x] `components/features/muscles/muscle-form.tsx`
- [x] `components/features/muscles/muscle-list.tsx`
- [x] `app/[locale]/(app)/muscles/page.tsx` + `error.tsx` + `loading.tsx`

### Exercises
- [x] `components/features/exercises/exercise-form.tsx`
- [x] `components/features/exercises/exercise-list.tsx` — thumbnail image in list
- [x] `app/[locale]/(app)/exercises/page.tsx` + `error.tsx` + `loading.tsx`

### Programs
- [x] `components/features/programs/program-form.tsx`
- [x] `components/features/programs/program-list.tsx`
- [x] `components/features/programs/program-detail.tsx` — workouts grid by day + exercises per workout
- [x] `components/features/programs/workout-form.tsx`
- [x] `components/features/programs/workout-exercise-form.tsx`
- [x] Generate Schedule button → `POST /training/programs/{id}/schedule`
- [x] `app/[locale]/(app)/programs/page.tsx` + `[id]/page.tsx` + `error.tsx` + `loading.tsx`

### Sessions
- [x] `components/features/sessions/session-list.tsx` — history list with status badges
- [x] `components/features/sessions/session-detail.tsx` — sets grouped by exercise
- [x] `app/[locale]/(app)/sessions/page.tsx` + `[id]/page.tsx` + `error.tsx` + `loading.tsx`

### Dashboard
- [x] `components/features/dashboard/train-hero.tsx` — Start/Finish train hero button + live timer
- [x] `components/features/dashboard/upcoming-sessions.tsx` — horizontal scrollable 14-day strip
- [x] `components/features/dashboard/hours-chart.tsx` — training hours bar chart (last 30 days)
- [x] `components/features/dashboard/program-progress-ring.tsx` — radial chart for active program
- [x] `components/features/dashboard/exercise-progress-chart.tsx` — line chart with exercise picker
- [x] `app/[locale]/(app)/dashboard/page.tsx` + `error.tsx` + `loading.tsx`

### Training Flow
- [x] `components/features/train/set-row.tsx` — weight/reps/RPE inputs + Done toggle
- [x] `components/features/train/train-view.tsx` — sets grouped by exercise + progress + finish
- [x] `app/[locale]/(app)/train/page.tsx` + `error.tsx` + `loading.tsx`

### Statistics
- [x] `components/features/statistics/statistics-view.tsx` — hours chart + program ring + exercise chart
- [x] `app/[locale]/(app)/statistics/page.tsx` + `error.tsx` + `loading.tsx`

### Polish
- [x] `components/shared/bottom-nav.tsx` — mobile bottom navigation bar (Dashboard, Programs, Sessions, Statistics)
- [x] `components/shared/locale-switcher.tsx` — EN / RU / HE toggle in header
- [x] RTL support for Hebrew (`dir="rtl"` on `<html>` via `getLocale()` in root layout)
- [x] `error.tsx` per route group (muscles, exercises, programs, sessions, train, statistics, dashboard)
- [x] `loading.tsx` per feature route group

---

## In Progress

- [x] Add Exercises tab to bottom navigation bar
- [x] Add "Generate Schedule" button per program card on programs list page

---

## Decisions

- `app/layout.tsx` uses `getLocale()` from `next-intl/server` to set `lang` + `dir` on `<html>` — no nested html tags
- `proxy.ts` (root) exports `proxy` + `proxyConfig` (Next.js 16+ naming)
- `components/ui/form.tsx` is a minimal hand-written wrapper around react-hook-form (shadcn `@shadcn/form` is empty in radix-nova style)
- `lib/api/client.ts` takes `locale` as explicit parameter — passed from hooks via `useLocale()`
- `(app)/layout.tsx` uses `AuthGuard` client component for redirect-on-no-token pattern
- React Query hooks call `useLocale()` at hook level, pass locale into API functions as closure
- Train store persists only `sessionId` + `startedAt`; `elapsedSeconds` recomputed on mount from `startedAt`

---

## Notes

- Primary usage: mobile. Design mobile-first, `md:` breakpoint for wider screens.
- Auth: login only, no registration.
- Auth API: `http://localhost:4000/api/v1`
- Workout API: `http://localhost:4001/api/v1`
- Workout DB: `postgresql://smarthome:smarthome_password@localhost:5433/workout`
- All translatable API requests must send `Accept-Language` header.
