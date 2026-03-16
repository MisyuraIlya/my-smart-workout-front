import { z } from 'zod'

export const programSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['active', 'done', 'canceled', 'inactive']),
  category: z.enum(['strength', 'mass', 'cardio']),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
})

export type ProgramFormValues = z.infer<typeof programSchema>
