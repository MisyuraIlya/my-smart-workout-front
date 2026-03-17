import { z } from 'zod'

export const workoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  day_no: z.number().int().min(1).max(7),
  program_id: z.string().min(1, 'Program is required'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
})

export type WorkoutFormValues = z.infer<typeof workoutSchema>
