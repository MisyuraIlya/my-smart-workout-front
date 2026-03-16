# Progress

## Status: Core Complete — All main features implemented

---

## Done

### Foundation
- [x] `npx create-next-app` scaffold with TypeScript + Tailwind v4
- [x] shadcn/ui init
- [x] Install core deps: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `next-intl`, `recharts`
- [x] `next.config.mjs` — `output: 'standalone'`, next-intl plugin
- [x] `i18n/routing.ts` + `middleware.ts` for locale routing (en, ru, he)
- [x] Message files `messages/en.json`, `messages/ru.json`, `messages/he.json`
- [x] Base API client `lib/api/client.ts` (Accept-Language + Bearer token + 401 handler)
- [x] `app/[locale]/layout.tsx` — locale-aware root layout with NextIntlClientProvider, ThemeProvider, QueryClientProvider
- [x] Zustand auth store `lib/stores/auth.store.ts` + localStorage persistence

---

## In Progress

_(nothing yet)_

---

## Up Next

### Auth
- [x] Zustand auth store `lib/stores/auth.store.ts` + localStorage persistence
- [x] Login page `/[locale]/login` — phone + password form

### Muscles
- [x] API hooks `lib/hooks/use-muscles.ts`
- [x] Muscles list page + create/edit/delete

### Exercises
- [x] API hooks `lib/hooks/use-exercises.ts`
- [x] Exercises list page + create/edit/delete
- [x] Exercise images — thumbnail in list, full preview in edit sheet (`getExerciseImageUrl` helper, `NEXT_PUBLIC_STORAGE_URL`)

### Programs
- [x] API hooks `lib/hooks/use-programs.ts`
- [x] Programs list page + create/edit/delete
- [x] Program detail page — workouts grid by day
- [x] Add exercises to each workout (Sheet/Drawer)
- [x] Generate Schedule button → `POST /training/programs/{id}/schedule`

### Workouts
- [x] API hooks `lib/hooks/use-workouts.ts`
- [x] Workout detail page — exercise list + add/remove exercises (via program detail)

### Sessions
- [x] API hooks `lib/hooks/use-sessions.ts`
- [x] Sessions history list
- [x] Session detail page — sets list

### Dashboard (main page)
- [x] Start Train hero button → `POST /training/workout-sessions/start-train`
- [x] Live elapsed timer (zustand `train.store.ts` + `setInterval`)
- [x] Finish Train button → `POST /training/workout-sessions/{id}/finish-train`
- [x] Upcoming sessions calendar (week strip, horizontal scroll)
- [x] Training hours bar chart (`recharts`, last 30 days)
- [x] Active program progress ring chart
- [x] Exercise progress line chart with exercise picker

### Training Flow (`/train`)
- [x] Load session sets grouped by exercise
- [x] Set row: weight + reps + RPE + notes + Done toggle
- [x] Track set → `POST /training/workout-session-sets/{id}/track` with optimistic update
- [x] Progress indicator (X/Y sets done)
- [x] Finish training → session summary

### Statistics
- [x] Full statistics page `/statistics`
- [x] Training hours chart (date range picker)
- [x] Exercise progress chart per exercise
- [x] Program progress card

### Polish
- [x] Bottom navigation bar (mobile)
- [x] RTL support for Hebrew (`dir="rtl"` on `<html>` — set in `[locale]/layout.tsx`)
- [x] `error.tsx` + `global-error.tsx` boundaries
- [x] Dashboard page — Start/Finish train, timer, upcoming sessions, charts
- [x] Locale switcher (`components/shared/locale-switcher.tsx`) — EN / RU / HE toggle in top-right header on all app pages

---

## Decisions

- **No `src/` directory** — project uses root-level `app/`, `components/`, `lib/` (shadcn init set it up this way). `@/*` alias maps to project root.
- **shadcn style is `radix-nova`**, not `default`. There is no `form.tsx` component in this registry — forms use `react-hook-form` directly with `Field` / `FieldGroup` / `FieldError` from `field.tsx`.
- **Root layout returns `{children}` only** — `app/[locale]/layout.tsx` owns the `<html>` / `<body>` tags so it can set `lang` and `dir` per locale.
- **Locale parsed from URL on client** — the API client reads the current locale from `window.location.pathname` (`/en|ru|he/`) instead of calling `useLocale()`, since it runs outside React components.
- **`train.store.ts` interval is not persisted** — `zustand/persist` skips `timerInterval` via `partialize`; on app reload the store calls `startSession` again to rehydrate the interval from `startedAt`.
- **Workouts managed via program detail page** — no standalone `/workouts/[id]` page; workout exercises are added/removed inside the program detail sheet to keep the flow linear.
- **Exercise images are served directly from MinIO** — API returns raw `storage_key` + `bucket_name`, no presigned URLs. Frontend constructs `NEXT_PUBLIC_STORAGE_URL/{bucket}/{key}`. `unoptimized` is set on `next/image` because images are GIFs.
- **All CRUD uses bottom `Sheet` on mobile** — create/edit forms open as a bottom drawer (`side="bottom"`) instead of navigating to a new page, per the mobile-first guidelines.

---

## Notes

- Primary usage: mobile. Design mobile-first, `md:` breakpoint for wider screens.
- Auth: login only, no registration.
- Auth API: `http://localhost:4000/api/v1`
- Workout API: `http://localhost:4001/api/v1`
- Workout DB: `postgresql://smarthome:smarthome_password@localhost:5433/workout`
- All translatable API requests must send `Accept-Language` header.