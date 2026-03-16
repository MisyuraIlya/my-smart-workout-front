# Progress

## Status: Starting fresh

---

## Done

_(nothing yet)_

---

## In Progress

_(nothing yet)_

---

## Up Next

### Foundation
- [ ] `npx create-next-app` scaffold with TypeScript + Tailwind v4
- [ ] shadcn/ui init
- [ ] Install core deps: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `next-intl` (recharts bundled via shadcn `chart` component)
- [ ] `next.config.mjs` — `output: 'standalone'`, next-intl plugin, `images.remotePatterns` for workout API (localhost:4001)
- [ ] `i18n/routing.ts` + `proxy.ts` for locale routing (en, ru, he) — Next.js 16+ uses `proxy.ts`, not `middleware.ts`
- [ ] Message files `messages/en.json`, `messages/ru.json`, `messages/he.json`
- [ ] Base API client `lib/api/client.ts` (Accept-Language + Bearer token + 401 handler)
- [ ] `app/[locale]/layout.tsx` — locale-aware root layout with NextIntlClientProvider, ThemeProvider, QueryClientProvider
- [ ] `app/global-error.tsx` — root error boundary (must render `<html><body>`, must be `'use client'`)
- [ ] `app/[locale]/error.tsx` — route-level error boundary (`'use client'`)
- [ ] `app/[locale]/not-found.tsx` — 404 page
- [ ] `app/[locale]/loading.tsx` — root loading state
- [ ] `app/api/health/route.ts` — health check endpoint for Docker
- [ ] Zustand auth store `lib/stores/auth.store.ts` + localStorage persistence

### Auth
- [ ] Login page `/[locale]/login` — phone + password form

### Muscles
- [ ] API hooks `lib/hooks/use-muscles.ts`
- [ ] Muscles list page + create/edit/delete

### Exercises
- [ ] API hooks `lib/hooks/use-exercises.ts`
- [ ] Exercises list page + create/edit/delete
- [ ] Exercise images — thumbnail in list, full preview in edit sheet

### Programs
- [ ] API hooks `lib/hooks/use-programs.ts`
- [ ] Programs list page + create/edit/delete
- [ ] Program detail page — workouts grid by day
- [ ] Add exercises to each workout (Sheet/Drawer)
- [ ] Generate Schedule button → `POST /training/programs/{id}/schedule`

### Workouts
- [ ] API hooks `lib/hooks/use-workouts.ts`
- [ ] Workout detail — exercise list + add/remove exercises (via program detail)

### Sessions
- [ ] API hooks `lib/hooks/use-sessions.ts`
- [ ] Sessions history list
- [ ] Session detail page — sets list

### Dashboard (main page)
- [ ] Start Train hero button → `POST /training/workout-sessions/start-train`
- [ ] Live elapsed timer (zustand `train.store.ts` + `setInterval`)
- [ ] Finish Train button → `POST /training/workout-sessions/{id}/finish-train`
- [ ] Upcoming sessions calendar (week strip, horizontal scroll)
- [ ] Training hours bar chart (shadcn `Chart` / recharts, last 30 days)
- [ ] Active program progress ring chart
- [ ] Exercise progress line chart with exercise picker

### Training Flow (`/train`)
- [ ] Load session sets grouped by exercise
- [ ] Set row: weight + reps + RPE + notes + Done toggle
- [ ] Track set → `POST /training/workout-session-sets/{id}/track` with optimistic update
- [ ] Progress indicator (X/Y sets done)
- [ ] Finish training → session summary

### Statistics
- [ ] Full statistics page `/statistics`
- [ ] Training hours chart (date range picker)
- [ ] Exercise progress chart per exercise
- [ ] Program progress card

### Polish
- [ ] Bottom navigation bar (mobile)
- [ ] RTL support for Hebrew (`dir="rtl"` on `<html>`)
- [ ] `error.tsx` per route group (already in Foundation for root; add per feature group)
- [ ] `loading.tsx` per feature route group (programs, exercises, sessions, train, statistics)
- [ ] Locale switcher (EN / RU / HE toggle in header)

---

## Decisions

_(none yet — will be recorded as they are made)_

---

## Notes

- Primary usage: mobile. Design mobile-first, `md:` breakpoint for wider screens.
- Auth: login only, no registration.
- Auth API: `http://localhost:4000/api/v1`
- Workout API: `http://localhost:4001/api/v1`
- Workout DB: `postgresql://smarthome:smarthome_password@localhost:5433/workout`
- All translatable API requests must send `Accept-Language` header.
