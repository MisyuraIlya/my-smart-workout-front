'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { SearchIcon } from 'lucide-react'

import {
  workoutExerciseSchema,
  type WorkoutExerciseFormValues,
} from '@/lib/validations/workout-exercise.schema'
import { useCreateWorkoutExercise } from '@/lib/hooks/use-workouts'
import { useExercises } from '@/lib/hooks/use-exercises'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Form, FormField } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  workoutId: string
  currentCount: number
  onSuccess: () => void
}

export function WorkoutExerciseForm({ workoutId, currentCount, onSuccess }: Props) {
  const t = useTranslations('exercises')
  const tc = useTranslations('common')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: exercises } = useExercises({ limit: 30, search: search || undefined })
  const createMutation = useCreateWorkoutExercise()

  const form = useForm<WorkoutExerciseFormValues>({
    resolver: zodResolver(workoutExerciseSchema),
    defaultValues: {
      exercise_id: '',
      sets: 3,
      target_reps: 10,
      rest_seconds: 90,
    },
  })

  async function onSubmit(data: WorkoutExerciseFormValues) {
    try {
      await createMutation.mutateAsync({
        ...data,
        workout_id: workoutId,
        position: currentCount + 1,
      })
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
            name="exercise_id"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('name')}</FieldLabel>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder={tc('search')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={tc('search')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {exercises?.items.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sets"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error || undefined}>
                  <FieldLabel>{t('sets')}</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    aria-invalid={!!fieldState.error}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <FormField
              control={form.control}
              name="target_reps"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error || undefined}>
                  <FieldLabel>{t('targetReps')}</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    aria-invalid={!!fieldState.error}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="rest_seconds"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('restSeconds')}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value) : null)
                  }
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Spinner data-icon="inline-start" />}
          {tc('add')}
        </Button>
      </form>
    </Form>
  )
}
