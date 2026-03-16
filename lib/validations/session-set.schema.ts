import { z } from 'zod'

export const trackSetSchema = z
  .object({
    reps: z.number().int().min(0).optional(),
    weight: z.number().min(0).optional(),
    rpe: z.number().min(0).max(10).optional(),
    rest_seconds: z.number().int().min(0).optional(),
    notes: z.string().optional(),
    is_done: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((val) => val !== undefined), {
    message: 'At least one field required',
  })

export type TrackSetValues = z.infer<typeof trackSetSchema>
