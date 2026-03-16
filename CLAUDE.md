# My Smart Workout — Frontend

Next.js 15 + shadcn/ui fitness tracking app (mobile-first).
Skills: `.agents/skills/shadcn/SKILL.md`, `.agents/skills/next-best-practices/SKILL.md`

---

## MCP Servers (`.mcp.json`)

Three MCP servers are active in this project. Use them proactively.

| Server | When to use |
|---|---|
| **shadcn** | Query component docs, search registry, add/update components. Prefer MCP over CLI for read operations (`docs`, `search`, `info`). For mutations (`add`, `init`) use `npx shadcn@latest` CLI. See `.agents/skills/shadcn/mcp.md`. |
| **playwright** | Open a real Chromium browser to verify UI rendering, test the login flow, debug layout on mobile viewport, screenshot pages. Use headless mode by default. |
| **postgres** | Inspect the actual DB schema and data when you need to understand what the backend stores. Use `POSTGRES_CONNECTION_STRING` env var — never hardcode credentials. |

---

## Core Stack

| Concern | Library |
|---|---|
| Framework | Next.js 15 App Router |
| UI | shadcn/ui (Tailwind v4) |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Server state | `@tanstack/react-query` |
| Client state | `zustand` |
| i18n | `next-intl` |

**Never** use raw `fetch` directly in components — always go through query hooks.
**Never** use `useState` for server data — that is `react-query`'s job.
**Never** use `react-query` for ephemeral UI state — that is `zustand`'s job.

---

## Project Directory Layout

```
src/
  app/
    [locale]/                  # next-intl locale wrapper
      (auth)/
        login/page.tsx
      (app)/
        dashboard/page.tsx
        programs/
          page.tsx
          [id]/page.tsx
        workouts/
          page.tsx
          [id]/page.tsx
        exercises/
          page.tsx
          [id]/page.tsx
        muscles/
          page.tsx
          [id]/page.tsx
        sessions/
          page.tsx
          [id]/page.tsx
        train/
          page.tsx             # active training flow
        statistics/
          page.tsx
  components/
    ui/                        # shadcn primitives (auto-generated)
    shared/                    # reusable app-level components
    features/
      auth/
      programs/
      workouts/
      exercises/
      muscles/
      sessions/
      train/
      statistics/
  lib/
    api/
      auth.ts                  # auth API client
      workout.ts               # workout API client
      client.ts                # base fetch wrapper (adds Authorization + Accept-Language)
    hooks/
      use-auth.ts
      use-locale.ts
    stores/
      auth.store.ts            # zustand: token, profile
      train.store.ts           # zustand: active session state
    validations/               # zod schemas mirroring API inputs
      auth.schema.ts
      exercise.schema.ts
      muscle.schema.ts
      program.schema.ts
      workout.schema.ts
      session.schema.ts
      session-set.schema.ts
  i18n/
    routing.ts
    navigation.ts
  messages/
    en.json
    ru.json
    he.json
  middleware.ts
```

---

## Authentication

**Scope: Login only. No registration UI.**

Auth service base URL: `http://localhost:4000/api/v1`

### Login endpoint

```
POST /profile/auth/login
Content-Type: application/json
Accept-Language: <locale>

{ "phone": "+15550003333", "password": "securepass123" }

200 → { "access_token": "...", "token_type": "Bearer", "profile": { ... } }
401 → { "error": "invalid credentials" }
```

### Auth flow

1. Login form submits via `react-hook-form` + zod schema `{ phone: z.string(), password: z.string().min(8) }`.
2. On success: store `access_token` + `profile` in zustand `auth.store.ts` **and** `localStorage` for persistence.
3. On app load: rehydrate zustand from `localStorage`; if no token redirect to `/login`.
4. Token attached to every workout API request as `Authorization: Bearer <token>`.
5. On 401 from any request: clear store → redirect to `/login`.

### Zustand auth store shape

```ts
interface AuthState {
  token: string | null
  profile: Profile | null
  setAuth: (token: string, profile: Profile) => void
  clearAuth: () => void
}
```

---

## API Client — Base Rules

File: `src/lib/api/client.ts`

- Every request must send `Accept-Language: <current next-intl locale>` (en | ru | he).
- Every protected request must send `Authorization: Bearer <token>` from auth store.
- On `401` response anywhere: call `clearAuth()` and `router.replace('/login')`.
- Workout service base URL: `http://localhost:4001/api/v1` (env var `NEXT_PUBLIC_WORKOUT_API_URL`).
- Auth service base URL: `http://localhost:4000/api/v1` (env var `NEXT_PUBLIC_AUTH_API_URL`).

```ts
// Pattern for every API function
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const locale = getLocale()          // next-intl
  const token = useAuthStore.getState().token

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (res.status === 401) { clearAuthAndRedirect(); throw new Error('Unauthorized') }
  if (!res.ok) { const body = await res.json(); throw new Error(body.error ?? 'API error') }
  if (res.status === 204) return undefined as T
  return res.json()
}
```

---

## Data Models (from API contracts)

### Pagination

All list endpoints return:
```ts
{ items: T[], meta: { page, limit, total, total_pages, has_next, has_prev } }
```
Query params: `?page=1&limit=20`

### Muscle
```ts
{ id, created_at, updated_at, name }
// Create: POST /training/muscles  (no body required)
// Update: PUT  /training/muscles/{id}  { name }
```

### Exercise
```ts
{
  id, created_at, updated_at,
  name, description, instructions: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  muscle_id,
  image?: { storage_key, bucket_name, mime_type, size_bytes, width?, height? }
}
// Create: POST /training/exercises  { muscle_id, difficulty? }
// Update: PUT  /training/exercises/{id}  { name?, description?, instructions?, muscle_id?, difficulty? }
```

### Program
```ts
{
  id, created_at, updated_at,
  name,
  status: 0 | 1 | 2 | 3 | 4,   // API returns integer; display as string
  category: 'strength' | 'mass' | 'cardio',
  starts_on: string,   // date-time
  ends_on:   string,   // date-time
}
// Create: POST /training/programs  { status: 'active'|'done'|'canceled'|'inactive', category, starts_on, ends_on }
// Update: PUT  /training/programs/{id}  { name, status?, category?, starts_on?, ends_on? }
// Generate schedule: POST /training/programs/{id}/schedule
//   → { program_id, sessions_created, sets_created }
```

**Program.status integer mapping:** 0=unknown, 1=active, 2=done, 3=canceled, 4=inactive

### Workout
```ts
{
  id, created_at, updated_at,
  name,
  day_no: 1–7,   // day inside weekly program
  program_id,
}
// Create: POST /training/workouts  { day_no, program_id }
// Update: PUT  /training/workouts/{id}  { name, day_no?, program_id? }
```

### WorkoutExercise
```ts
{
  id, created_at, updated_at,
  position,        // order within workout
  sets,
  target_reps,
  rest_seconds?,
  workout_id,
  exercise_id,
}
// Create: POST /training/workout-exercises  { position, sets, target_reps, workout_id, exercise_id, rest_seconds? }
// Update: PUT  /training/workout-exercises/{id}  { position, sets, target_reps, workout_id, exercise_id, rest_seconds? }
```

### WorkoutSession
```ts
{
  id, created_at, updated_at,
  started_at, ended_at?,
  notes?,
  workout_id,
  status: 'planned' | 'in_progress' | 'done' | 'skipped',
  scheduled_on,    // YYYY-MM-DD
  skip_reason?,
}
// Create: POST /training/workout-sessions  { workout_id, started_at?, ended_at?, notes?, status?, scheduled_on?, skip_reason? }
// Update: PUT  /training/workout-sessions/{id}  (same fields)
// Start training:  POST /training/workout-sessions/start-train
//   → picks closest planned session for today → returns WorkoutSession
// Finish training: POST /training/workout-sessions/{id}/finish-train
//   → returns updated WorkoutSession
```

### WorkoutSessionSet
```ts
{
  id, created_at, updated_at,
  set_number, reps, rest_seconds?,
  notes?, weight?, rpe?,
  is_done,
  session_id,
  exercise_id,
}
// Create: POST /training/workout-session-sets  { set_number, reps, session_id, exercise_id, rest_seconds?, notes?, weight?, rpe?, is_done? }
// Update: PUT  /training/workout-session-sets/{id}  (same required fields)
// Track (live): POST /training/workout-session-sets/{id}/track
//   { reps?, rest_seconds?, notes?, weight?, rpe?, is_done? }  (at least one field)
```

### Statistics

```
GET /training/statistics/hours?from=YYYY-MM-DD&to=YYYY-MM-DD
→ { from, to, total_seconds, total_hours, total_sessions, daily: DailyPoint[] }
  DailyPoint: { date, total_seconds, hours, sessions }

GET /training/statistics/exercises/{id}/progress?from=YYYY-MM-DD&to=YYYY-MM-DD
→ { exercise_id, exercise_name, from, to, summary: Summary, points: ProgressPoint[] }
  Summary: { total_sessions, total_sets, total_reps, total_volume, best_weight?, best_estimated_one_rm? }
  ProgressPoint: { date, sessions, sets, total_reps, total_volume, max_weight?, estimated_one_rm? }

GET /training/statistics/programs/{id}/progress
→ { program_id, program_name, status, starts_on, ends_on, today,
    total_days, elapsed_days, remaining_days, time_completion_percent,
    is_finished, planned_workouts, completed_workouts, workout_completion_percent,
    total_sessions, total_hours }
```

---

## React Query — Naming & Structure

Every entity gets a dedicated hooks file under `src/lib/hooks/`:

```ts
// Pattern
export const programKeys = {
  all: ['programs'] as const,
  list: (params: PaginationParams) => [...programKeys.all, 'list', params] as const,
  detail: (id: string) => [...programKeys.all, 'detail', id] as const,
}

export function usePrograms(params: PaginationParams) {
  return useQuery({ queryKey: programKeys.list(params), queryFn: () => getPrograms(params) })
}
export function useProgram(id: string) {
  return useQuery({ queryKey: programKeys.detail(id), queryFn: () => getProgramById(id), enabled: !!id })
}
export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: programKeys.all }),
  })
}
```

- Invalidate `all` key after create/update/delete.
- Use `optimisticUpdate` for set tracking (live training UX).
- Wrap pages that fetch data in `<Suspense>` boundaries; show `<Skeleton>` fallback.

---

## Forms — Rules

All forms use `react-hook-form` + `zod` + `@hookform/resolvers/zod`.
All form layouts use shadcn `FieldGroup` + `Field` — never raw `div` + `Label`.

```tsx
// Required pattern for every form
const schema = z.object({ ... })
type FormValues = z.infer<typeof schema>

export function ProgramForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslations('programs')
  const { mutate, isPending } = useCreateProgram()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ... },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data, { onSuccess }))}>
        <FieldGroup>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel>{t('name')}</FieldLabel>
                <Input {...field} aria-invalid={!!fieldState.error} />
                {fieldState.error && (
                  <FieldDescription>{fieldState.error.message}</FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {t('save')}
        </Button>
      </form>
    </Form>
  )
}
```

---

## i18n — next-intl Rules

Locales: `en`, `ru`, `he`
RTL: `he` requires `dir="rtl"` on `<html>`.

- All user-visible strings must be in `messages/{locale}.json` — no hardcoded English.
- API calls must pass `Accept-Language` from the active locale.
- Use `useTranslations('namespace')` in Client Components, `getTranslations('namespace')` in Server Components.
- Locale is in the URL: `/en/...`, `/ru/...`, `/he/...`.
- Use `next-intl` navigation helpers (`Link`, `useRouter`, `redirect`) — never the raw Next.js ones.

Message key structure:
```
common.save / common.cancel / common.delete / common.edit / common.create
common.loading / common.empty / common.error
auth.login / auth.phone / auth.password
programs.title / programs.create / programs.status.active / programs.category.strength
exercises.difficulty.beginner ...
sessions.status.planned / sessions.status.in_progress ...
statistics.title / statistics.trainingHours / statistics.exerciseProgress ...
```

---

## shadcn/ui Rules (summary from SKILL.md)

- Use **semantic colors** only: `bg-primary`, `text-muted-foreground` — never `bg-blue-500`.
- Use **`gap-*`**, never `space-x-*` / `space-y-*`.
- Use **`size-*`** when width == height.
- **Icons in buttons**: `data-icon="inline-start"` on icon element, no `size-4` classes.
- **No manual `dark:` overrides**.
- **Loading buttons**: compose `Spinner` + `disabled` — there is no `isPending` prop on `Button`.
- **Toasts**: use `toast()` from `sonner` — never custom divs.
- **Modals**: always include `DialogTitle` (use `className="sr-only"` if visually hidden).
- **Empty states**: use `Empty` component, not custom markup.
- **Skeletons**: use `Skeleton` for loading, not custom `animate-pulse` divs.

---

## Next.js App Router Rules (summary from SKILL.md)

- Default to **Server Components**. Add `"use client"` only when you need hooks, event handlers, or browser APIs.
- **Async params/searchParams** in Next.js 15: always `await params` before using.
- **`useSearchParams()`** requires a `<Suspense>` boundary — always wrap the component.
- Never use `<img>` — always `next/image`.
- Never use `<Link>` from `next/link` for locale-aware navigation — use `next-intl`'s `Link`.
- **Error boundaries**: every route group needs `error.tsx`; root needs `global-error.tsx`.
- Server Actions for mutations that don't need optimistic updates; react-query mutations for everything in interactive UI.
- `output: 'standalone'` in `next.config.ts` for Docker deployment.

---

## Mobile-First UI Guidelines

Primary usage is mobile. Design decisions:

- Default layout: single-column stacked on mobile, wider on `md:` and above.
- Bottom navigation bar for main sections (Programs, Workouts, Sessions, Stats).
- Use `Sheet` (side panel) and `Drawer` (bottom sheet) for forms on mobile — not full page navigations for simple CRUD.
- Use `Dialog` for confirmations and delete prompts.
- Touch targets minimum `44px` (`min-h-11` / `min-w-11`).
- Training active session screen: large set/rep counters, one-tap "Done" per set.
- Statistics charts: horizontal scroll or responsive sizing — never clip on narrow screens.
- Use `ScrollArea` for long lists inside containers.
- Paginated lists: infinite scroll or "Load more" button — no numbered pagination on mobile.

---

## App Routes Summary

| Route | Description |
|---|---|
| `/[locale]/login` | Login form (phone + password) |
| `/[locale]/dashboard` | Overview: today's session, quick stats |
| `/[locale]/programs` | Program list + create |
| `/[locale]/programs/[id]` | Program detail, workouts list, generate schedule, progress stats |
| `/[locale]/workouts` | Workout list |
| `/[locale]/workouts/[id]` | Workout detail + exercise list |
| `/[locale]/exercises` | Exercise library list + create |
| `/[locale]/exercises/[id]` | Exercise detail + progress chart |
| `/[locale]/muscles` | Muscle group list + create |
| `/[locale]/sessions` | Session history list |
| `/[locale]/sessions/[id]` | Session detail + sets |
| `/[locale]/train` | Active training screen (start-train → live set tracking → finish-train) |
| `/[locale]/statistics` | Training hours chart + program progress cards |

---

## Training Flow (key UX)

1. User taps **"Start Training"** → `POST /training/workout-sessions/start-train`
   - Returns the `WorkoutSession` with status `in_progress`.
   - Store session ID in `train.store.ts` (zustand).
2. Show all sets for this session grouped by exercise.
3. Each set row has: target reps, weight input, RPE input, "Done" toggle.
4. Tapping "Done" on a set → `POST /training/workout-session-sets/{id}/track` with `{ is_done: true, reps, weight, rpe }`.
   - Optimistic update in react-query for instant UI feedback.
5. When all sets are done → enable **"Finish Training"** → `POST /training/workout-sessions/{id}/finish-train`.
6. Clear `train.store.ts`, navigate to session summary.

---

## Zod Validation Schemas (reference)

```ts
// auth
export const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(8),
})

// program
export const createProgramSchema = z.object({
  status: z.enum(['active', 'done', 'canceled', 'inactive']),
  category: z.enum(['strength', 'mass', 'cardio']),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// exercise
export const createExerciseSchema = z.object({
  muscle_id: z.string().uuid(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
})

// workout
export const createWorkoutSchema = z.object({
  day_no: z.number().int().min(1).max(7),
  program_id: z.string().uuid(),
})

// workout exercise
export const createWorkoutExerciseSchema = z.object({
  position: z.number().int().min(1),
  sets: z.number().int().min(1),
  target_reps: z.number().int().min(1),
  rest_seconds: z.number().int().nullable().optional(),
  workout_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
})

// session set tracking
export const trackSetSchema = z.object({
  reps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  rpe: z.number().min(0).max(10).optional(),
  rest_seconds: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  is_done: z.boolean().optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' })
```

---

## Error Handling

- API errors return `{ error: string }` or `{ status: string, message: string }`.
- Display API error messages via `toast.error(...)` from `sonner`.
- `Accept-Language` validation errors return `{ status: 'error', message: '...' }`.
- Use `error.tsx` for page-level errors, `global-error.tsx` for root layout errors.
- Network errors: show retry button with `useQueryErrorResetBoundary`.
