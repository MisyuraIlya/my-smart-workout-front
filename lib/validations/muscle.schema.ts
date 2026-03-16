import { z } from 'zod'

export const muscleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export type MuscleFormValues = z.infer<typeof muscleSchema>
