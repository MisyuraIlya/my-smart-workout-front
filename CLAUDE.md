# My Smart Workout — Frontend

Next.js 15 + shadcn/ui fitness tracking app (mobile-first).

---

## MANDATORY: Read Skills Before Any Work

**Before writing or editing any code, you MUST read these skill files in full:**

1. **shadcn/ui skill** → `.agents/skills/shadcn/SKILL.md`
   - Also read: `.agents/skills/shadcn/rules/styling.md`, `.agents/skills/shadcn/rules/forms.md`, `.agents/skills/shadcn/rules/icons.md`, `.agents/skills/shadcn/rules/composition.md`, `.agents/skills/shadcn/rules/base-vs-radix.md`
   - Also read: `.agents/skills/shadcn/cli.md`, `.agents/skills/shadcn/customization.md`, `.agents/skills/shadcn/mcp.md`

2. **Next.js best practices skill** → `.agents/skills/next-best-practices/SKILL.md`
   - Also read all companion files in `.agents/skills/next-best-practices/` that are relevant to the task (directives, async-patterns, data-patterns, error-handling, suspense-boundaries, rsc-boundaries, hydration-error, etc.)

These skills override any general knowledge you have about shadcn/ui and Next.js. Do not guess — read them first.

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

File: `lib/api/client.ts`

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
For 2–7 mutually-exclusive options (category, status, difficulty) use `ToggleGroup` + `ToggleGroupItem` — never a loop of `Button` with manual active state.

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

This project uses **`radix-nova`** style (`base: radix`). Always check `npx shadcn@latest info` for installed components before adding or importing.

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

### Radix API Rules (project uses `radix` base)

**Triggers — always use `asChild`**, never wrap in an extra element:
```tsx
// Correct
<DialogTrigger asChild><Button>Open</Button></DialogTrigger>
// Wrong
<DialogTrigger><div><Button>Open</Button></div></DialogTrigger>
```
Applies to: `DialogTrigger`, `SheetTrigger`, `AlertDialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `CollapsibleTrigger`, `DialogClose`, `SheetClose`.

**ToggleGroup** — use `type="single"` or `type="multiple"`, `defaultValue` is a string (single) or string array (multiple):
```tsx
<ToggleGroup type="single" defaultValue="strength">...</ToggleGroup>
```

**Accordion** — use `type="single"` or `type="multiple"`, add `collapsible` for single. `defaultValue` is a string:
```tsx
<Accordion type="single" collapsible defaultValue="item-1">...</Accordion>
```

**Slider** — `defaultValue` is always an array:
```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

**Select** — inline JSX (no `items` prop), placeholder via `<SelectValue placeholder="...">`:
```tsx
<Select>
  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="strength">Strength</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

---

## Next.js App Router Rules (summary from SKILL.md)

- Default to **Server Components**. Add `"use client"` only when you need hooks, event handlers, or browser APIs.
- **Async params/searchParams** in Next.js 15+: type as `Promise<{...}>` and always `await` before using.
  ```tsx
  type Props = { params: Promise<{ id: string }> }
  export default async function Page({ params }: Props) {
    const { id } = await params
  }
  ```
- **`useSearchParams()`** requires a `<Suspense>` boundary — always wrap the component.
- **`usePathname()`** requires a `<Suspense>` boundary in dynamic routes (`[id]`, `[locale]`, etc.).
- Never use `<img>` — always `next/image`. Exercise images come from the workout API — add `remotePatterns` in `next.config.mjs`:
  ```js
  images: { remotePatterns: [{ protocol: 'http', hostname: 'localhost', port: '4001' }] }
  ```
- Never use `<Link>` from `next/link` for locale-aware navigation — use `next-intl`'s `Link`.
- **Error boundaries**: every route group needs `error.tsx` (`'use client'` required); root needs `global-error.tsx` (must include `<html>` and `<body>`).
- Add `loading.tsx` per route segment for automatic Suspense-powered loading UI.
- Add `not-found.tsx` per route group for 404 states; call `notFound()` from server components when resource is missing.
- **Never catch `redirect()` / `notFound()` / `forbidden()` in try-catch** — they throw internally. Either call them outside the try block, or use `unstable_rethrow(error)` inside catch.
- Server Actions for mutations that don't need optimistic updates; react-query mutations for everything in interactive UI.
- `output: 'standalone'` in `next.config.mjs` for Docker deployment.
- **Middleware is `proxy.ts` in Next.js 16+** (renamed from `middleware.ts`). Export `proxy()` and `proxyConfig` instead of `middleware()` and `config`.

### RSC Boundary — Non-Serializable Props

Props from Server → Client must be JSON-serializable. Never pass:
- `Date` objects → use `.toISOString()` and reconstruct with `new Date()` in the client
- `Map` / `Set` → convert to `Object.fromEntries()` / `Array.from()`
- Class instances → pass plain objects
- Plain functions → define inside the client component (Server Actions with `'use server'` are the exception)

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
| `/[locale]/dashboard` | **Main page**: Start/Finish train button, live timer, upcoming sessions calendar, progress charts |
| `/[locale]/programs` | Program list + create |
| `/[locale]/programs/[id]` | Program detail → workouts list → exercises per workout → Generate Schedule button |
| `/[locale]/workouts/[id]` | Workout detail + exercise list |
| `/[locale]/exercises` | Exercise library list + create |
| `/[locale]/exercises/[id]` | Exercise detail + progress chart |
| `/[locale]/muscles` | Muscle group list + create |
| `/[locale]/sessions` | Session history list |
| `/[locale]/sessions/[id]` | Session detail + sets |
| `/[locale]/train` | Active training screen (live set tracking during session) |
| `/[locale]/statistics` | Full statistics page |

---

## Dashboard Screen (main page after login)

The dashboard is the heart of the app. Three stacked sections on mobile:

### 1. Start / Finish Train Hero Button

- Default state: large full-width **"Start Training"** button (prominent, `min-h-16`).
- On tap → `POST /training/workout-sessions/start-train`
  - `404` response = no planned session today → show toast "No session planned for today" and disable button.
  - `200` = session started → store `session_id` + `started_at` in `train.store.ts`.
- Active state: button transforms to show:
  - Live **elapsed timer** (counting up from `started_at`, updated every second via `setInterval` in zustand).
  - **"Finish Training"** label replaces "Start Training".
  - Color changes to destructive/warning variant.
- On "Finish Training" tap → `POST /training/workout-sessions/{id}/finish-train`
  - On success: clear `train.store.ts`, show toast "Session complete 🎉", navigate to session summary `/sessions/[id]`.
- If `train.store.ts` has an active session on app load → restore timer state (session was started before, app was closed).
- The button also links to `/train` where the user does the actual set tracking during the session.

### 2. Upcoming Sessions Calendar

- Horizontal scrollable week strip (Mon–Sun) showing which days have planned sessions.
- Fetch sessions: `GET /training/workout-sessions?status=planned` filtered to the next 14 days.
- Days with sessions show a dot indicator and workout name.
- Tapping a day navigates to that session detail.
- Use `ScrollArea` horizontal for the week strip.

### 3. Progress Charts

Use the shadcn **`Chart`** component (wraps recharts) — `npx shadcn@latest add chart`. Never use canvas or raw recharts directly.

Three chart cards stacked vertically:

**Training Hours (bar chart)**
- `GET /training/statistics/hours?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Default range: last 30 days.
- Bar chart: x = date, y = hours. Show `total_hours` and `total_sessions` as summary badges above chart.

**Active Program Progress (radial/progress)**
- `GET /training/statistics/programs/{id}/progress` for the current active program.
- Show: program name, date range, circular progress ring (`workout_completion_percent`), days remaining.
- If no active program → show empty state with link to create a program.

**Exercise Progress (line chart)**
- `GET /training/statistics/exercises/{id}/progress?from=...&to=...`
- Let user pick an exercise from a dropdown (default: most recently trained).
- Line chart: x = date, y = max_weight or estimated_one_rm.
- Show summary: total sets, total reps, total volume, best weight.

---

## Training Flow — Active Session (`/train`)

Navigated to from the dashboard Start button once a session is `in_progress`.

1. **Load session sets**: `GET /training/workout-sessions/{id}` to get full session data.
2. **Group sets by exercise**: display as accordion or flat list grouped by exercise name.
3. **Each set row** (large touch targets, `min-h-14`):
   - Set number badge
   - Target reps (from `workout_exercise.target_reps`) shown as hint
   - Weight input (`number`, step 0.5 kg)
   - Reps input (`number`)
   - RPE input (optional, 0–10 scale, shown as chip selector)
   - Notes input (optional, expandable text field)
   - **"Done" toggle** — large checkbox/button
4. **Tapping "Done"** → `POST /training/workout-session-sets/{id}/track`
   ```json
   { "reps": 10, "weight": 80.5, "rpe": 8, "notes": "felt strong", "is_done": true }
   ```
   - Optimistic update in react-query for instant UI.
   - At least one field is required (API contract) — `is_done: true` always satisfies this.
   - Show checkmark animation on success.
5. **Progress indicator**: "X / Y sets done" shown at top.
6. **Finish button**: enabled when all sets are done OR user manually enables it. Calls `POST /training/workout-sessions/{id}/finish-train`.

### train.store.ts shape

```ts
interface TrainState {
  sessionId: string | null
  startedAt: string | null          // ISO string from API
  elapsedSeconds: number            // updated every second
  timerInterval: ReturnType<typeof setInterval> | null
  startSession: (sessionId: string, startedAt: string) => void
  finishSession: () => void
  tickTimer: () => void
}
```

---

## Program Creation Flow

Full guided flow: Program → Workouts → Exercises → Generate Schedule.

### Step 1 — Create Program (`POST /training/programs`)

Fields: name, category (`strength` | `mass` | `cardio`), starts_on (date), ends_on (date), status (default `inactive`).

### Step 2 — Create Workouts for the Program (`POST /training/workouts`)

On program detail page `/programs/[id]`:
- Show days of the week (Mon–Sun) as a grid.
- User taps a day → opens Sheet with workout name + day_no (1–7).
- Can create multiple workouts (e.g., Mon=Chest, Wed=Back, Fri=Legs).
- Display created workouts as cards per day.

### Step 3 — Add Exercises to Each Workout

On workout detail via Sheet/Drawer on the program page:
- List of `workout_exercises` for this workout.
- "Add Exercise" → opens exercise picker (search from exercise library).
- Per exercise: set `position`, `sets`, `target_reps`, `rest_seconds`.
- Reorder exercises by dragging (update `position` via PUT).

### Step 4 — Generate Schedule

- Prominent **"Generate Schedule"** button on program detail page.
- Validates before calling: program must have ≥ 1 workout, each workout must have ≥ 1 exercise.
- Calls `POST /training/programs/{id}/schedule`
  - Returns `{ program_id, sessions_created, sets_created }`.
  - Show success toast: "Schedule created: {sessions_created} sessions, {sets_created} sets".
- After generation, program status should be set to `active` (PUT program).
- Button is disabled if schedule was already generated (check if sessions exist for this program).

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
- Use `error.tsx` for page-level errors (`'use client'` required), `global-error.tsx` for root layout errors (must render `<html><body>`).
- Network errors: show retry button with `useQueryErrorResetBoundary`.

## Hydration Pitfalls

Avoid these patterns that cause server/client mismatch:

- **Dates/times**: never render `new Date().toLocaleString()` directly. For the live timer, initialize `elapsedSeconds` in `useEffect`, not on render.
- **Browser APIs**: never read `window.*` / `localStorage` during render — gate behind `useEffect` or a `mounted` check.
- **Random IDs**: use `useId()` from React, not `Math.random()`.
- **Invalid HTML**: no `<div>` inside `<p>`, no nested `<p>`.

## Debugging (Next.js 16+)

The dev server exposes `/_next/mcp` by default — use it to get build errors, routes, and logs without reading files manually:

```bash
# Get current build/runtime errors
curl -X POST http://localhost:3000/_next/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"get_errors","arguments":{}}}'

# Available tools: get_errors | get_routes | get_project_metadata | get_logs | get_server_action_by_id
```

Rebuild a single route without full build:
```bash
next build --debug-build-paths "/[locale]/dashboard"
```
