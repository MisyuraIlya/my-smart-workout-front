# CLAUDE.md

## Mission
Build a **Next.js + shadcn/ui** frontend app for workouts using only backend modules:
- `backend/internal/module/training/**`
- `backend/internal/module/profile/**`

This frontend is a **multi-language app** with locales:
- `en`
- `ru`
- `he`

Authentication scope:
- **Login only**
- **Do not implement registration UI**

API contract source:
- `backend/api/http/app.yaml`
- Use this Swagger/OpenAPI file as the single source of truth for endpoints and payloads.

## Core Stack Requirements
- Next.js (App Router, TypeScript)
- shadcn/ui components for all UI controls
- `react-hook-form` for all forms
- Use reusable typed API client layer (no direct fetch in page components)
- Keep code clean, modular, and feature-based

## Non-Negotiable Rules
- Use only training + profile modules. Ignore finance/groceries/alice.
- Login page only for auth; no register page.
- Every form must use `react-hook-form`.
- All translatable data requests must send `Accept-Language` with selected locale.
- Hebrew (`he`) must render RTL direction.
- Do not hardcode API types when they exist in Swagger.
- Handle loading, empty, and error states on every data screen.

## Environment
Create `.env.local`:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`

## Recommended Packages
Install if missing:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `@tanstack/react-query`
- `next-intl` (or equivalent i18n solution)

## High-Level Architecture
Use this structure (or equivalent clean variant):
- `app/[locale]/(auth)/login/page.tsx`
- `app/[locale]/(app)/layout.tsx`
- `app/[locale]/(app)/dashboard/page.tsx`
- `app/[locale]/(app)/training/...` pages
- `src/features/auth/...`
- `src/features/training/...`
- `src/shared/api/client.ts`
- `src/shared/api/endpoints/...`
- `src/shared/i18n/...`
- `src/shared/ui/...`

## Internationalization
- Locales: `en`, `ru`, `he`
- Add locale switcher in app shell.
- Persist locale in URL segment (`/[locale]/...`).
- On locale change, all API reads for translated resources must re-fetch with new `Accept-Language`.
- Set `<html dir="rtl">` for `he`, otherwise `ltr`.
- Provide dictionary files for UI text:
  - `messages/en.json`
  - `messages/ru.json`
  - `messages/he.json`

## Authentication Flow (Profile Module)
Use only:
- `POST /profile/auth/login`
- `GET /profile/me`

Expected login input (from Swagger):
- `phone`
- `password`

Expected login response:
- `access_token`
- `token_type`
- `profile`

Implementation rules:
- Store token in a client-safe persistence strategy.
- Attach `Authorization: Bearer <token>` for protected endpoints.
- On 401, clear auth state and redirect to `/{locale}/login`.
- Provide logout action in app header.

## Training Module Scope
Implement full CRUD UI for:
- muscles
- exercises
- programs
- workouts
- workout-exercises
- workout-sessions
- workout-session-sets

Use exact endpoints and payloads from `backend/api/http/app.yaml`.

## Important API Behaviors To Respect
### Translation-aware entities
These have localized `name` behavior via `Accept-Language`:
- muscles
- exercises
- programs
- workouts

Create/update behavior:
- Muscle create: `POST /training/muscles` with empty body, returns `{ id }`.
- Exercise create: requires `muscle_id`, returns `{ id }`.
- Program create: requires `status`, `starts_on`, `ends_on`, returns `{ id }`.
- Workout create: requires `day_no`, `program_id`, returns `{ id }`.
- Name is set/updated via `PUT .../{id}` with `name` in body and proper `Accept-Language` header.

### Date and validation notes
- Program create/update date inputs use `YYYY-MM-DD` for request payload (`starts_on`, `ends_on`).
- Workout `day_no` allowed range is 1..7.
- Workout session create/update requires `workout_id`; `started_at` can be omitted (backend defaults it).
- Workout session create/update may return 404 if `workout_id` does not exist.

## UI/UX Requirements
- Use shadcn components for all forms, dialogs, table/list, tabs, dropdowns, toast alerts.
- Mobile-first responsive layout.
- Provide consistent app shell:
  - top bar with locale switcher + user menu/logout
  - left nav (or mobile drawer) for training sections
- Each resource page must include:
  - list view
  - create action
  - edit action
  - delete action with confirmation

## Form Requirements (react-hook-form)
Use `react-hook-form` + schema validation for:
- login
- muscle name update
- exercise create/update
- program create/update
- workout create/update
- workout-exercise create/update
- workout-session create/update
- workout-session-set create/update

## Data Layer Requirements
- Centralized API client with:
  - base URL from env
  - auth header injection
  - locale header injection (`Accept-Language`)
  - normalized error mapping
- Separate endpoint functions per module (`auth`, `training`).
- Use query/mutation hooks (preferred with React Query).
- Invalidate/refetch relevant queries after mutations.

## Pages To Build (Minimum)
- `/{locale}/login`
- `/{locale}/dashboard`
- `/{locale}/training/muscles`
- `/{locale}/training/exercises`
- `/{locale}/training/programs`
- `/{locale}/training/workouts`
- `/{locale}/training/workout-exercises`
- `/{locale}/training/workout-sessions`
- `/{locale}/training/workout-session-sets`

## Delivery Checklist
- App boots and runs with `npm run dev`.
- Login works and protected routes require auth.
- Locale switcher works for EN/RU/HE and HE is RTL.
- Training CRUD works end-to-end with backend.
- Translation behavior works through `Accept-Language`.
- All forms implemented with `react-hook-form`.
- No registration page exists.
- No usage of finance/groceries endpoints.

## If Swagger and Backend Conflict
If you discover mismatch between runtime behavior and `backend/api/http/app.yaml`:
- Prefer backend runtime behavior.
- Document mismatch in a short `KNOWN_GAPS.md`.
- Keep frontend robust with defensive error handling.

## Future Instructions
More instructions may be appended below by the project owner. Always treat newer instructions as higher priority when they do not violate the scope above.
