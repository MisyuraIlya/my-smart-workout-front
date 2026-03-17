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
- [x] Refactor session detail page to use single `GET /training/workout-sessions/{id}/session-data` endpoint
  - `session-detail.tsx` — replaced `useSession` + `useSessionSets` with `useSessionData`; `sets` from `session.sets` (no pagination); removed `ScrollArea` (natural page scroll); exercise image thumbnail + difficulty badge shown per group; `exercise_name` used directly (no UUID fallback); `session-set-row.tsx` type updated from `WorkoutSessionSet` to `SessionDataSet`

- [x] Refactor train page to use single `GET /training/workout-sessions/{id}/session-data` endpoint
  - Added `SessionDataSet`, `SessionData` types to `lib/api/workout.ts`; added `getSessionData` API function
  - Added `sessionKeys.sessionData(id)` cache key + `useSessionData` hook to `use-sessions.ts`
  - `useTrackSet` now also invalidates `sessionData` key so train view refreshes after each set is tracked
  - `train-view.tsx` — replaced `useSession` + `useSessionSets` (2 requests) with single `useSessionData`; exercises grouped by `exercise_id` using embedded `exercise_name` + `exercise_difficulty` + `image`; exercise thumbnail (`next/image`, 48×48) and difficulty badge shown above each group's sets; date (`scheduled_on`) shown as subtitle instead of workout name
  - `set-row.tsx` — updated prop type from `WorkoutSessionSet` to `SessionDataSet`; removed unused `targetReps` prop

- [x] Add search + infinite scroll to exercises, muscles, programs, sessions list pages
  - Added `search` param to `PaginationParams` — passed as `?search=` query param by muscles, exercises, programs, workouts API functions
  - Added `useInfiniteExercises`, `useInfiniteMuscles`, `useInfinitePrograms` hooks using `useInfiniteQuery` (page-based, `getNextPageParam` from `meta.has_next`)
  - `exercise-list`, `muscle-list`, `program-list` — replaced static `useQuery` with infinite hooks; added debounced (300ms) search input with `SearchIcon`; "Load more" button appears when `hasNextPage`; empty state shows "No results" vs "Nothing here yet" depending on active search
  - `workout-exercise-form` exercise picker — replaced `limit: 200` with `limit: 30` + debounced search input above the Select, filters exercises via API
  - Added `common.loadMore` to `en.json`, `ru.json`, `he.json`
  - `session-list.tsx` — removed `ScrollArea` wrapper (was blocking viewport-based IntersectionObserver), added `useInfiniteSessions` hook; same sentinel pattern
  - Fixed IntersectionObserver double-fetch bug: observer was recreated on every `isFetchingNextPage` change, firing immediately when sentinel was already in viewport and fetching the same page twice. Fix: observer created once (`deps=[]`), reads from refs (`hasNextPageRef`, `isFetchingRef`, `fetchNextPageRef`) updated via separate `useEffect`s — applied to all 4 list components

- [x] Refactor program detail page to use single `GET /training/programs/{id}/program-data` endpoint — replaces N+1 fetches (program + workouts list + per-workout exercises) with one request that returns program, workouts, and exercises with images in a single response
  - Added `ProgramWorkoutExercise`, `ProgramWorkout`, `ProgramData` types to `lib/api/workout.ts`
  - Added `getProgramData` API function
  - Added `programKeys.data(id)` cache key + `useProgramData` hook to `lib/hooks/use-programs.ts`
  - `useCreateWorkout`, `useDeleteWorkout`, `useCreateWorkoutExercise`, `useDeleteWorkoutExercise` in `use-workouts.ts` now also invalidate `['programs']` so `useProgramData` cache refreshes after mutations
  - `program-detail.tsx` — replaced `useProgram` + `useWorkouts` + per-workout `useWorkoutExercises` with single `useProgramData`; exercises passed as props, no child-level fetchers
  - `workout-exercise-item.tsx` — updated to `ProgramWorkoutExercise` type; now shows exercise thumbnail (Minio via `NEXT_PUBLIC_STORAGE_URL`) and difficulty badge

- [x] Add search to Exercise Progress chart on dashboard — replaced static `useExercises({ limit: 100 })` with debounced (300ms) search input + `useExercises({ limit: 30, search })` so exercises are filtered server-side as you type
  - `components/features/dashboard/exercise-progress-chart.tsx` — added `SearchIcon` input row below title; search and select sit side-by-side (`flex-1` input + fixed `w-36` select)

- [x] Fix Upcoming Sessions showing only today — backend `GET /training/workout-sessions` had no WHERE clause and ignored `status`/`from`/`to` params entirely; added dedicated `/upcoming` endpoint
  - `my-smart-workout/internal/adapter/postgres/workout_session.go` — `GetUpcomingWorkoutSessions`: queries `status IN ('planned','in_progress') AND scheduled_on BETWEEN $1 AND $2 ORDER BY scheduled_on ASC`
  - `my-smart-workout/internal/usecase/workout_session.go` — `GetUpcoming` method + interface entry
  - `my-smart-workout/internal/handler/workout_session.go` — `GetUpcomingWorkoutSessions` handler; parses `from`/`to`, defaults to today → +14 days
  - `my-smart-workout/internal/handler/router.go` — `GET /workout-sessions/upcoming` registered before `/{id}`
  - `my-smart-workout/api/http/app.yaml` — new path entry with `from`/`to` query params and `{ items: WorkoutSession[] }` response schema
  - `lib/api/workout.ts` — `getUpcomingSessions(from, to, locale)`
  - `lib/hooks/use-sessions.ts` — `useUpcomingSessions(from, to)` hook
  - `components/features/dashboard/upcoming-sessions.tsx` — switched from `useSessions` to `useUpcomingSessions`

- [x] Fix upcoming sessions dot never appearing — `scheduled_on` from API is RFC3339 (`"2025-03-18T00:00:00Z"`) but map was keyed by the full string while day strip uses `"YYYY-MM-DD"` keys; lookup always missed. Fixed by slicing to `.slice(0, 10)` when building `sessionsByDate`
  - `components/features/dashboard/upcoming-sessions.tsx`

- [x] Sessions list date format — `scheduled_on` now displayed as `DD-MM-YYYY` instead of raw `YYYY-MM-DD`
  - `components/features/sessions/session-card.tsx` — string slice reshape (no `new Date()` to avoid timezone shift)

- [x] Fix infinite scroll not fetching next page + duplicate key error on sessions/exercises/muscles/programs list pages
  - **Root cause 1 (infinite scroll broken):** `IntersectionObserver` was created in a `useEffect` with `deps=[]` — sentinel `<div>` isn't in the DOM yet on first run (items still loading), so the observer was set up on `null` and never triggered. Fix: replaced `useEffect`-based observer setup with a **callback ref** (`sentinelRef = useCallback((el) => { ... }, [])`) so the observer is created exactly when the sentinel mounts into the DOM.
  - **Root cause 2 (duplicate keys):** React Strict Mode double-invokes callback refs (mount → unmount → remount); on each mount the observer fires immediately (sentinel already in viewport), calling `fetchNextPage()` twice before `isFetchingNextPage` could update via `useEffect`. Fix: added a synchronous `fetchingRef` guard — set to `true` immediately when `fetchNextPage()` is called, reset to `false` via `useEffect` when `isFetchingNextPage` becomes `false`. Also moved `hasNextPageRef`/`fetchNextPageRef` sync from `useEffect` to **direct assignment during render** (eliminates async gap). Applied to all 4 list components: `exercise-list`, `muscle-list`, `program-list`, `session-list`.
  - **Root cause 3 (backend duplicate items across pages):** All paginated list queries used `ORDER BY created_at DESC` without a tiebreaker. Since many rows share identical `created_at` timestamps (bulk auto-generated sessions), PostgreSQL returns rows in non-deterministic order between queries — the boundary row at offset N appears in both page N and page N+1. Fix: added `id ASC` as secondary sort key to all 5 paginated backend queries.
    - `my-smart-workout/internal/adapter/postgres/workout_session.go` — `ORDER BY created_at DESC, id ASC`
    - `my-smart-workout/internal/adapter/postgres/muscle.go` — `ORDER BY m.created_at DESC, m.id ASC`
    - `my-smart-workout/internal/adapter/postgres/program.go` — `ORDER BY p.created_at DESC, p.id ASC`
    - `my-smart-workout/internal/adapter/postgres/exercise.go` — `ORDER BY e.created_at DESC, e.id ASC`
    - `my-smart-workout/internal/adapter/postgres/workout.go` — `ORDER BY w.created_at DESC, w.id ASC`

- [x] Add bottom padding to app layout so list content is not hidden behind fixed bottom navigation bar
  - `app/[locale]/(app)/layout.tsx` — wrapped `{children}` in `<div className="pb-20">` (80px clears the ~56px nav bar with breathing room); applies to all app pages automatically

- [x] Fix Generate Schedule button making unwanted PUT request after POST schedule
  - `components/features/programs/program-detail.tsx` — removed `updateProgram.mutateAsync({ status: 'active' })` call that fired after schedule generation; backend `PUT /training/programs/{id}` requires `name` and was erroring with `"name is required"`; setting status to active post-schedule is not needed, so the entire second request was dropped

- [x] Add calendar to sessions page — month view with session dot indicators, day filtering, and infinite-scroll fallback
  - Installed `shadcn calendar` component (react-day-picker v9 + date-fns v4)
  - `lib/hooks/use-sessions.ts` — added `useSessionsForMonth(from, to)` hook; fetches `GET /training/workout-sessions?from=...&to=...&limit=100` for the visible month; result cached per month by React Query
  - `components/features/sessions/session-list.tsx` — added `showTitle` prop (defaults `true`) so the list title can be suppressed when embedded inside the calendar view
  - `components/features/sessions/session-calendar.tsx` — new `SessionCalendarView` client component:
    - Controlled month (`useState`) + controlled selected date (`useState`)
    - `modifiers={{ hasSessions: sessionDates }}` marks days that have sessions; custom `DayButtonWithDot` renders a 6px dot inside each marked day (white when selected, primary color otherwise); date math uses local time (`new Date(y, m-1, d)`) to avoid UTC timezone shift against `scheduled_on` (YYYY-MM-DD)
    - Clicking a day filters sessions in-memory from the already-fetched month data — no extra API request
    - Day header shows formatted date + "Clear" button; navigating to another month clears the selection and re-fetches
    - When no day is selected → falls back to `<SessionList showTitle={false} />` (existing infinite scroll)
    - `date-fns/locale` objects (enUS / ru / he) passed to `Calendar` so month/weekday names render in the active locale
  - `app/[locale]/(app)/sessions/page.tsx` — replaced `<SessionList />` with `<SessionCalendarView />`
  - Added i18n keys `sessions.allSessions`, `sessions.clearDate`, `sessions.dayEmpty` to `en.json`, `ru.json`, `he.json`

- [x] Add `start_time` field to workouts — intended start time (HH:MM) for each workout in a program
  - DB: `ALTER TABLE workout ADD COLUMN start_time TIME` (nullable)
  - Backend: `start_time *string` added to `domain.Workout`, `dto.WorkoutResponse`, `dto.CreateWorkoutRequest`, `dto.UpdateWorkoutRequest`, `dto.ProgramDataWorkoutResponse`
  - Backend postgres: SELECT uses `TO_CHAR(start_time, 'HH24:MI')`, INSERT/UPDATE use `$N::TIME`; `GetProgramData` also returns `workout_start_time`
  - Backend usecase: passes through on create; on update keeps existing value if not provided, clears if empty string sent
  - `api/http/app.yaml` — `start_time` added to `CreateWorkoutInput` and `UpdateWorkoutInput` schemas
  - Frontend `lib/api/workout.ts` — `start_time?` on `Workout` and `ProgramWorkout` types + API function signatures
  - Frontend `lib/validations/workout.schema.ts` — `start_time` optional, `HH:MM` regex or empty string
  - Frontend `lib/hooks/use-workouts.ts` — `start_time?` in `useCreateWorkout` / `useUpdateWorkout` mutation types
  - Frontend `components/features/programs/workout-form.tsx` — `<Input type="time">` field; populates from existing value on edit
  - Frontend `components/features/programs/program-detail.tsx` — `WorkoutCard` shows `ClockIcon + "HH:MM"` below workout name when set; passes `start_time` into edit form
  - i18n: `workouts.startTime` added to `en.json` (Start Time), `ru.json` (Время начала), `he.json` (שעת התחלה)

- [x] Add popularity filter to exercises list page
  - Backend: `GET /training/exercises?popularity=N` (1..5) — filter exercises by popularity score
  - `lib/api/workout.ts` — added `popularity?: number` to `Exercise` interface; added `popularity` param to `getExercises` query string
  - `lib/hooks/use-exercises.ts` — extracted `ExerciseFilterParams` type with `popularity?`; `useExercises` + `useInfiniteExercises` accept and key on `popularity`
  - `components/features/exercises/exercise-list.tsx` — added `popularity` state; search input and popularity `Select` sit side-by-side; options: "All" (clears filter) + ★ through ★★★★★ for 1–5; changing popularity re-fetches from page 1 via React Query key change
  - i18n: `exercises.popularityAll` added to `en.json` ("All"), `ru.json` ("Все"), `he.json` ("הכל")

- [x] Add floating "Active Session" banner — return-to-train UX when navigating away from `/train`
  - `components/shared/active-session-banner.tsx` — fixed pill above the bottom nav (`bottom-16`); shows pulsing dot + "Session in progress" label + live elapsed timer; tapping navigates to `/train`; hidden when already on `/train`; only renders when `sessionId` is set in train store
  - Moved timer interval ownership from `TrainHero` to `ActiveSessionBanner` — `TrainHero` was clearing the interval on unmount (navigating away from dashboard stopped the timer); banner lives in the app layout so the interval now runs for the full duration of the session regardless of which page is active
  - `components/features/dashboard/train-hero.tsx` — removed `setInterval` / `useEffect` for timer; now just reads `elapsedSeconds` from the store
  - `app/[locale]/(app)/layout.tsx` — added `<ActiveSessionBanner />`; bumped bottom padding from `pb-20` to `pb-32` to clear both the nav bar and the banner

---

## Decisions

- `app/layout.tsx` uses `getLocale()` from `next-intl/server` to set `lang` + `dir` on `<html>` — no nested html tags
- `proxy.ts` (root) exports `proxy` + `proxyConfig` (Next.js 16+ naming)
- `components/ui/form.tsx` is a minimal hand-written wrapper around react-hook-form (shadcn `@shadcn/form` is empty in radix-nova style)
- `lib/api/client.ts` takes `locale` as explicit parameter — passed from hooks via `useLocale()`
- `(app)/layout.tsx` uses `AuthGuard` client component for redirect-on-no-token pattern
- React Query hooks call `useLocale()` at hook level, pass locale into API functions as closure
- Train store persists only `sessionId` + `startedAt`; `elapsedSeconds` recomputed on mount from `startedAt`
- `ActiveSessionBanner` (in app layout) owns the timer interval — `TrainHero` only reads `elapsedSeconds` from the store; interval survives navigation

---

## Notes

- Primary usage: mobile. Design mobile-first, `md:` breakpoint for wider screens.
- Auth: login only, no registration.
- Auth API: `http://localhost:4000/api/v1`
- Workout API: `http://localhost:4001/api/v1`
- Workout DB: `postgresql://smarthome:smarthome_password@localhost:5433/workout`
- All translatable API requests must send `Accept-Language` header.
