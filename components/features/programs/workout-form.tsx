'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { workoutSchema, type WorkoutFormValues } from '@/lib/validations/workout.schema'
import { useCreateWorkout, useUpdateWorkout } from '@/lib/hooks/use-workouts'
import type { Workout } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Form, FormField } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'

interface Props {
  programId: string
  dayNo: number
  workout?: Workout
  onSuccess: () => void
}

export function WorkoutForm({ programId, dayNo, workout, onSuccess }: Props) {
  const t = useTranslations('workouts')
  const tc = useTranslations('common')
  const createMutation = useCreateWorkout()
  const updateMutation = useUpdateWorkout()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: workout?.name ?? '',
      day_no: workout?.day_no ?? dayNo,
      program_id: programId,
      start_time: workout?.start_time ?? '',
    },
  })

  async function onSubmit(data: WorkoutFormValues) {
    try {
      // pass empty string to clear, undefined if untouched (never set)
      const payload = {
        ...data,
        start_time: data.start_time || '',
      }
      if (workout) {
        await updateMutation.mutateAsync({ id: workout.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc('error'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FieldGroup>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('name')}</FieldLabel>
                <Input {...field} placeholder={t('namePlaceholder')} aria-invalid={!!fieldState.error} />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="start_time"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('startTime')}</FieldLabel>
                <Input
                  {...field}
                  type="time"
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {tc('save')}
        </Button>
      </form>
    </Form>
  )
}
