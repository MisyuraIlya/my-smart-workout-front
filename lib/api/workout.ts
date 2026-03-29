import { workoutApiFetch } from './client'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface ProgramPaginationParams extends PaginationParams {
  dateFrom?: string
  dateTo?: string
}

export interface Muscle {
  id: string
  created_at: string
  updated_at: string
  name: string
}

export interface ExerciseImage {
  storage_key: string
  bucket_name: string
  mime_type: string
  size_bytes: number
  width?: number
  height?: number
}

export interface Exercise {
  id: string
  created_at: string
  updated_at: string
  name: string
  description?: string
  instructions: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  muscle_id: string
  popularity?: number
  image?: ExerciseImage
}

export interface Program {
  id: string
  created_at: string
  updated_at: string
  name: string
  status: 0 | 1 | 2 | 3 | 4
  category: 'strength' | 'mass' | 'cardio'
  starts_on: string
  ends_on: string
}

export interface Workout {
  id: string
  created_at: string
  updated_at: string
  name: string
  day_no: 1 | 2 | 3 | 4 | 5 | 6 | 7
  program_id: string
  start_time?: string // HH:MM, e.g. "07:30"
}

export interface WorkoutExercise {
  id: string
  created_at: string
  updated_at: string
  position: number
  sets: number
  target_reps: number
  rest_seconds?: number | null
  workout_id: string
  exercise_id: string
  exercise?: Exercise
}

export interface WorkoutSession {
  id: string
  created_at: string
  updated_at: string
  started_at?: string
  ended_at?: string
  notes?: string
  workout_id: string
  status: 'planned' | 'in_progress' | 'done' | 'skipped'
  scheduled_on: string
  skip_reason?: string
  workout?: Workout
}

export interface WorkoutSessionSet {
  id: string
  created_at: string
  updated_at: string
  set_number: number
  reps: number
  rest_seconds?: number
  notes?: string
  weight?: number
  rpe?: number
  is_done: boolean
  session_id: string
  exercise_id: string
  exercise?: Exercise
}

export interface DailyPoint {
  date: string
  total_seconds: number
  hours: number
  sessions: number
}

export interface HoursStatistics {
  from: string
  to: string
  total_seconds: number
  total_hours: number
  total_sessions: number
  daily: DailyPoint[]
}

export interface ExerciseSummary {
  total_sessions: number
  total_sets: number
  total_reps: number
  total_volume: number
  best_weight?: number
  best_estimated_one_rm?: number
}

export interface ProgressPoint {
  date: string
  sessions: number
  sets: number
  total_reps: number
  total_volume: number
  max_weight?: number
  estimated_one_rm?: number
}

export interface ExerciseProgressStatistics {
  exercise_id: string
  exercise_name: string
  from: string
  to: string
  summary: ExerciseSummary
  points: ProgressPoint[]
}

export interface ProgramProgressStatistics {
  program_id: string
  program_name: string
  status: number
  starts_on: string
  ends_on: string
  today: string
  total_days: number
  elapsed_days: number
  remaining_days: number
  time_completion_percent: number
  is_finished: boolean
  planned_workouts: number
  completed_workouts: number
  workout_completion_percent: number
  total_sessions: number
  total_hours: number
}

export interface SessionDataSet {
  id: string
  created_at: string
  updated_at: string | null
  set_number: number
  reps: number
  rest_seconds?: number | null
  notes?: string | null
  weight?: number | null
  rpe?: number | null
  is_done: boolean
  session_id: string
  exercise_id: string
  exercise_name: string
  exercise_difficulty?: 'beginner' | 'intermediate' | 'advanced'
  image?: ExerciseImage
}

export interface SessionData {
  id: string
  created_at: string
  updated_at: string | null
  started_at?: string
  ended_at?: string | null
  notes?: string | null
  workout_id: string
  status: 'planned' | 'in_progress' | 'done' | 'skipped'
  scheduled_on: string
  skip_reason?: string | null
  sets: SessionDataSet[]
}

export type CardioType = 'run' | 'swim' | 'spinning'

export interface CardioEntry {
  id: string
  created_at: string
  updated_at?: string | null
  user_id: string
  type: CardioType
  started_at: string
  ended_at?: string | null
  duration_seconds: number
  calories?: number | null
  distance_km?: number | null
}

export interface ScheduleResult {
  program_id: string
  sessions_created: number
  sets_created: number
}

export interface ProgramWorkoutExercise {
  workout_exercise_id: string
  exercise_id: string
  name: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  image?: ExerciseImage
  position: number
  sets: number
  target_reps: number
  rest_seconds?: number
}

export interface ProgramWorkout {
  id: string
  created_at: string
  updated_at: string | null
  name: string
  day_no: 1 | 2 | 3 | 4 | 5 | 6 | 7
  start_time?: string // HH:MM
  exercises: ProgramWorkoutExercise[]
}

export interface ProgramData extends Program {
  workouts: ProgramWorkout[]
}

// ─── Muscles ────────────────────────────────────────────────────────────────

function qs(params: Record<string, string | number | undefined>) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export function getMuscles(params: PaginationParams, locale: string) {
  return workoutApiFetch<PaginatedResponse<Muscle>>(
    `/training/muscles${qs({ page: params.page ?? 1, limit: params.limit ?? 20, search: params.search })}`,
    locale,
  )
}

export function createMuscle(data: { name: string }, locale: string) {
  return workoutApiFetch<Muscle>('/training/muscles', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateMuscle(id: string, data: { name: string }, locale: string) {
  return workoutApiFetch<Muscle>(`/training/muscles/${id}`, locale, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteMuscle(id: string, locale: string) {
  return workoutApiFetch<void>(`/training/muscles/${id}`, locale, {
    method: 'DELETE',
  })
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export function getExercises(
  params: PaginationParams & { muscle_id?: string; popularity?: number },
  locale: string,
) {
  return workoutApiFetch<PaginatedResponse<Exercise>>(
    `/training/exercises${qs({ page: params.page ?? 1, limit: params.limit ?? 20, muscle_id: params.muscle_id, search: params.search, popularity: params.popularity })}`,
    locale,
  )
}

export function getExerciseById(id: string, locale: string) {
  return workoutApiFetch<Exercise>(`/training/exercises/${id}`, locale)
}

export function createExercise(
  data: {
    name: string
    description?: string
    instructions?: string[]
    muscle_id: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    popularity?: number
  },
  locale: string,
) {
  return workoutApiFetch<Exercise>('/training/exercises', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateExercise(
  id: string,
  data: {
    name?: string
    description?: string
    instructions?: string[]
    muscle_id?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    popularity?: number
  },
  locale: string,
) {
  return workoutApiFetch<Exercise>(`/training/exercises/${id}`, locale, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteExercise(id: string, locale: string) {
  return workoutApiFetch<void>(`/training/exercises/${id}`, locale, {
    method: 'DELETE',
  })
}

// ─── Programs ────────────────────────────────────────────────────────────────

export function getPrograms(params: ProgramPaginationParams, locale: string) {
  return workoutApiFetch<PaginatedResponse<Program>>(
    `/training/programs${qs({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    })}`,
    locale,
  )
}

export function getProgramById(id: string, locale: string) {
  return workoutApiFetch<Program>(`/training/programs/${id}`, locale)
}

export function createProgram(
  data: {
    name: string
    status: 'active' | 'done' | 'canceled' | 'inactive'
    category: 'strength' | 'mass' | 'cardio'
    starts_on: string
    ends_on: string
  },
  locale: string,
) {
  return workoutApiFetch<Program>('/training/programs', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProgram(
  id: string,
  data: {
    name?: string
    status?: 'active' | 'done' | 'canceled' | 'inactive'
    category?: 'strength' | 'mass' | 'cardio'
    starts_on?: string
    ends_on?: string
  },
  locale: string,
) {
  return workoutApiFetch<Program>(`/training/programs/${id}`, locale, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteProgram(id: string, locale: string) {
  return workoutApiFetch<void>(`/training/programs/${id}`, locale, {
    method: 'DELETE',
  })
}

export function generateSchedule(id: string, locale: string) {
  return workoutApiFetch<ScheduleResult>(`/training/programs/${id}/schedule`, locale, {
    method: 'POST',
  })
}

export function getProgramData(id: string, locale: string) {
  return workoutApiFetch<ProgramData>(`/training/programs/${id}/program-data`, locale)
}

// ─── Workouts ────────────────────────────────────────────────────────────────

export function getWorkouts(params: PaginationParams & { program_id?: string }, locale: string) {
  return workoutApiFetch<PaginatedResponse<Workout>>(
    `/training/workouts${qs({ page: params.page ?? 1, limit: params.limit ?? 20, program_id: params.program_id, search: params.search })}`,
    locale,
  )
}

export function getWorkoutById(id: string, locale: string) {
  return workoutApiFetch<Workout>(`/training/workouts/${id}`, locale)
}

export function createWorkout(
  data: { name: string; day_no: number; program_id: string; start_time?: string },
  locale: string,
) {
  return workoutApiFetch<Workout>('/training/workouts', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateWorkout(
  id: string,
  data: { name?: string; day_no?: number; program_id?: string; start_time?: string },
  locale: string,
) {
  return workoutApiFetch<Workout>(`/training/workouts/${id}`, locale, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWorkout(id: string, locale: string) {
  return workoutApiFetch<void>(`/training/workouts/${id}`, locale, {
    method: 'DELETE',
  })
}

// ─── Workout Exercises ────────────────────────────────────────────────────────

export function getWorkoutExercises(workout_id: string, locale: string) {
  return workoutApiFetch<PaginatedResponse<WorkoutExercise>>(
    `/training/workout-exercises${qs({ workout_id, limit: 100 })}`,
    locale,
  )
}

export function createWorkoutExercise(
  data: {
    position: number
    sets: number
    target_reps: number
    rest_seconds?: number | null
    workout_id: string
    exercise_id: string
  },
  locale: string,
) {
  return workoutApiFetch<WorkoutExercise>('/training/workout-exercises', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateWorkoutExercise(
  id: string,
  data: {
    position?: number
    sets?: number
    target_reps?: number
    rest_seconds?: number | null
    workout_id?: string
    exercise_id?: string
  },
  locale: string,
) {
  return workoutApiFetch<WorkoutExercise>(`/training/workout-exercises/${id}`, locale, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWorkoutExercise(id: string, locale: string) {
  return workoutApiFetch<void>(`/training/workout-exercises/${id}`, locale, {
    method: 'DELETE',
  })
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function getSessions(
  params: PaginationParams & {
    status?: 'planned' | 'in_progress' | 'done' | 'skipped'
    from?: string
    to?: string
  },
  locale: string,
) {
  return workoutApiFetch<PaginatedResponse<WorkoutSession>>(
    `/training/workout-sessions${qs({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      status: params.status,
      from: params.from,
      to: params.to,
    })}`,
    locale,
  )
}

export function getUpcomingSessions(from: string, to: string, locale: string) {
  return workoutApiFetch<{ items: WorkoutSession[] }>(
    `/training/workout-sessions/upcoming${qs({ from, to })}`,
    locale,
  )
}

export function getSessionById(id: string, locale: string) {
  return workoutApiFetch<WorkoutSession>(`/training/workout-sessions/${id}`, locale)
}

export function getSessionData(id: string, locale: string) {
  return workoutApiFetch<SessionData>(`/training/workout-sessions/${id}/session-data`, locale)
}

export function startTrain(locale: string) {
  return workoutApiFetch<WorkoutSession>('/training/workout-sessions/start-train', locale, {
    method: 'POST',
  })
}

export function finishTrain(id: string, locale: string) {
  return workoutApiFetch<WorkoutSession>(`/training/workout-sessions/${id}/finish-train`, locale, {
    method: 'POST',
  })
}

// ─── Session Sets ─────────────────────────────────────────────────────────────

export function getSessionSets(session_id: string, locale: string) {
  return workoutApiFetch<PaginatedResponse<WorkoutSessionSet>>(
    `/training/workout-session-sets${qs({ session_id, limit: 200 })}`,
    locale,
  )
}

export function trackSet(
  id: string,
  data: {
    reps?: number
    rest_seconds?: number
    notes?: string
    weight?: number
    rpe?: number
    is_done?: boolean
  },
  locale: string,
) {
  return workoutApiFetch<WorkoutSessionSet>(
    `/training/workout-session-sets/${id}/track`,
    locale,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

// ─── Cardio ──────────────────────────────────────────────────────────────────

export function getCardioEntries(params: PaginationParams, locale: string) {
  return workoutApiFetch<PaginatedResponse<CardioEntry>>(
    `/training/cardio${qs({ page: params.page ?? 1, limit: params.limit ?? 20 })}`,
    locale,
  )
}

export async function getActiveCardio(locale: string): Promise<CardioEntry | null> {
  const result = await workoutApiFetch<CardioEntry | undefined>('/training/cardio/active', locale)
  return result ?? null
}

export function startCardio(data: { type: CardioType }, locale: string) {
  return workoutApiFetch<CardioEntry>('/training/cardio/start', locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function finishCardio(
  id: string,
  data: {
    calories?: number
    distance_km?: number
  },
  locale: string,
) {
  return workoutApiFetch<CardioEntry>(`/training/cardio/${id}/finish`, locale, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export function getHoursStatistics(from: string, to: string, locale: string) {
  return workoutApiFetch<HoursStatistics>(
    `/training/statistics/hours${qs({ from, to })}`,
    locale,
  )
}

export function getExerciseProgressStatistics(
  exerciseId: string,
  from: string,
  to: string,
  locale: string,
) {
  return workoutApiFetch<ExerciseProgressStatistics>(
    `/training/statistics/exercises/${exerciseId}/progress${qs({ from, to })}`,
    locale,
  )
}

export function getProgramProgressStatistics(programId: string, locale: string) {
  return workoutApiFetch<ProgramProgressStatistics>(
    `/training/statistics/programs/${programId}/progress`,
    locale,
  )
}
