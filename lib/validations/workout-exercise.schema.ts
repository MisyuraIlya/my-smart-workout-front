import { z } from 'zod'

export const workoutExerciseSchema = z.object({
  exercise_id: z.string().min(1, 'Exercise is required'),
  sets: z.number().int().min(1, 'At least 1 set required'),
  target_reps: z.number().int().min(1, 'At least 1 rep required'),
  rest_seconds: z.number().int().min(0).nullable().optional(),
})

export type WorkoutExerciseFormValues = z.infer<typeof workoutExerciseSchema>
