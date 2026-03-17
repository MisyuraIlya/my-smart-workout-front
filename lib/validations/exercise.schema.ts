import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  muscle_id: z.string().min(1, 'Muscle group is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  popularity: z.number().int().min(1).max(5).optional(),
})

export type ExerciseFormValues = z.infer<typeof exerciseSchema>
