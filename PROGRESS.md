# Progress

## Status: Not Started — Ready to Build

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
- [ ] Install core deps: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `next-intl`
- [ ] `next.config.ts` — `output: 'standalone'`, next-intl plugin
- [ ] `src/i18n/routing.ts` + `middleware.ts` for locale routing (en, ru, he)
- [ ] Empty message files `messages/en.json`, `messages/ru.json`, `messages/he.json`
- [ ] Base API client `src/lib/api/client.ts` (Accept-Language + Bearer token + 401 handler)

### Auth
- [ ] Zustand auth store `src/lib/stores/auth.store.ts` + localStorage persistence
- [ ] Login page `/[locale]/login` — phone + password form

### Muscles
- [ ] API hooks `src/lib/hooks/use-muscles.ts`
- [ ] Muscles list page + create/edit/delete

### Exercises
- [ ] API hooks `src/lib/hooks/use-exercises.ts`
- [ ] Exercises list page + create/edit/delete

### Programs
- [ ] API hooks `src/lib/hooks/use-programs.ts`
- [ ] Programs list page + create/edit/delete
- [ ] Program detail page — workouts list + generate schedule

### Workouts
- [ ] API hooks `src/lib/hooks/use-workouts.ts`
- [ ] Workout detail page — exercise list + add/remove exercises

### Sessions
- [ ] API hooks `src/lib/hooks/use-sessions.ts`
- [ ] Sessions history list
- [ ] Session detail page — sets list

### Training Flow
- [ ] Active training screen `/[locale]/train`
- [ ] Start training → `POST /training/workout-sessions/start-train`
- [ ] Live set tracking with optimistic updates
- [ ] Finish training → session summary

### Statistics
- [ ] Training hours chart (date range picker)
- [ ] Exercise progress chart per exercise
- [ ] Program progress card

### Polish
- [ ] Bottom navigation bar (mobile)
- [ ] RTL support for Hebrew (`dir="rtl"` on `<html>`)
- [ ] `error.tsx` + `global-error.tsx` boundaries
- [ ] Dashboard page — today's session + quick stats

---

## Decisions

_(architectural decisions made during development go here)_

---

## Notes

- Primary usage: mobile. Design mobile-first, `md:` breakpoint for wider screens.
- Auth: login only, no registration.
- Auth API: `http://localhost:4000/api/v1`
- Workout API: `http://localhost:4001/api/v1`
- Workout DB: `postgresql://smarthome:smarthome_password@localhost:5433/workout`
- All translatable API requests must send `Accept-Language` header.