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

- [x] Extract list item card components — each `map()` in a list now renders a dedicated card component
  - `components/features/exercises/exercise-card.tsx` — `ExerciseCard` (image, difficulty badge, edit drawer, delete dialog)
  - `components/features/muscles/muscle-card.tsx` — `MuscleCard` (name, edit drawer, delete dialog)
  - `components/features/programs/program-card.tsx` — `ProgramCard` (status/category badges, schedule button, delete dialog)
  - `components/features/sessions/session-card.tsx` — `SessionCard` (status badge, date, workout name, link to detail)
  - `components/features/programs/workout-exercise-item.tsx` — `WorkoutExerciseItem` (exercise name, sets×reps, inline delete)
  - `components/features/sessions/session-set-row.tsx` — `SessionSetRow` (set number, weight/reps/RPE, done badge)
  - Updated: `exercise-list`, `muscle-list`, `program-list`, `session-list`, `program-detail`, `session-detail`

- [x] Fix double scroll on train page — `pb-32` on `<main>` caused page-level scroll on top of the inner `ScrollArea` scroll, leaving dead space at the bottom
  - `app/[locale]/(app)/train/page.tsx` — replaced `py-6 pb-32` with `pt-6 h-[calc(100dvh-3.5rem)] overflow-hidden` to constrain page to viewport, no overflow
  - `components/features/train/train-view.tsx` — outer div gets `h-full`; `ScrollArea` changed from `h-[calc(100vh-16rem)]` to `flex-1 min-h-0` (fills remaining space via flex); inner content padding moved to `pb-28` so last set clears the fixed Finish button

## In Progress

- [x] Add Exercises tab to bottom navigation bar
- [x] Add "Generate Schedule" button per program card on programs list page
- [x] Fix exercise image loading — added `unoptimized` to `next/image` in `exercise-list.tsx` to bypass Next.js SSRF private-IP block for Minio images served from `192.168.1.x:9000`
- [x] Add explicit TypeScript types across all feature components
  - Extract named types `DailyPoint`, `ProgressPoint`, `ExerciseSummary` from inline arrays in `lib/api/workout.ts`
  - React Query infers `data` type from `queryFn` return — callback parameter annotations in `.map()` / `.filter()` / `.reduce()` are redundant and were removed
  - Removed redundant explicit type annotations from map/filter/reduce callbacks: `exercise-list`, `muscle-list`, `program-list`, `session-list`, `program-detail`, `session-detail`
  - Dropped now-unused `type` imports (`Exercise`, `Muscle`, `Program`, `WorkoutSession`, `WorkoutExercise`) from list components — types flow from the hook through React Query inference
  - `WorkoutSessionSet` kept in `session-detail` — still needed as generic parameter for `reduce<Record<string, WorkoutSessionSet[]>>`
  - Affected: `exercise-list`, `muscle-list`, `program-list`, `program-detail`, `session-list`, `session-detail`, `train-view`, `statistics-view`, `exercise-progress-chart`, `hours-chart`, `upcoming-sessions`, `use-statistics`

- [x] Highlight nearest upcoming session in dashboard Upcoming Sessions strip — fills the nearest session's day card with `bg-primary text-primary-foreground` so it visually stands out as "next up"
- [x] Fix auth session lost on page reload — Zustand `persist` rehydrates asynchronously; `AuthGuard` was redirecting to `/login` before localStorage was read. Added `_hasHydrated` flag + `onRehydrateStorage` to `auth.store.ts`; `AuthGuard` now waits for hydration before checking token.

## UI Improvements

- [x] Replaced all `Sheet` (slide-from-right) with `Drawer` (slide-from-bottom) for create/edit forms across all feature pages — mobile-first feel
  - `components/features/muscles/muscle-list.tsx` — create + edit muscle
  - `components/features/exercises/exercise-list.tsx` — create + edit exercise
  - `components/features/programs/program-list.tsx` — create program
  - `components/features/programs/program-detail.tsx` — edit program, edit workout, add exercise to workout, add workout per day
- [x] Generate Schedule button on program detail page is now a sticky bottom bar (fixed above bottom nav) — always visible during program setup flow, disabled until at least one workout exists

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
