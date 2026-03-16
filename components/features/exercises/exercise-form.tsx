'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { exerciseSchema, type ExerciseFormValues } from '@/lib/validations/exercise.schema'
import { useCreateExercise, useUpdateExercise } from '@/lib/hooks/use-exercises'
import { useMuscles } from '@/lib/hooks/use-muscles'
import type { Exercise } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface Props {
  exercise?: Exercise
  onSuccess: () => void
}

export function ExerciseForm({ exercise, onSuccess }: Props) {
  const t = useTranslations('exercises')
  const tc = useTranslations('common')
  const { data: muscles } = useMuscles({ limit: 100 })
  const createMutation = useCreateExercise()
  const updateMutation = useUpdateExercise()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name ?? '',
      description: exercise?.description ?? '',
      instructions: exercise?.instructions?.join('\n') ?? '',
      muscle_id: exercise?.muscle_id ?? '',
      difficulty: exercise?.difficulty ?? undefined,
    },
  })

  async function onSubmit(data: ExerciseFormValues) {
    const instructions = data.instructions
      ? data.instructions.split('\n').map((s) => s.trim()).filter(Boolean)
      : []

    try {
      if (exercise) {
        await updateMutation.mutateAsync({
          id: exercise.id,
          data: { ...data, instructions },
        })
      } else {
        await createMutation.mutateAsync({ ...data, instructions })
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
            name="muscle_id"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('muscle')}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={tc('search')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {muscles?.items.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t('difficulty.label')}</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={field.value ?? ''}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="beginner">{t('difficulty.beginner')}</ToggleGroupItem>
                  <ToggleGroupItem value="intermediate">{t('difficulty.intermediate')}</ToggleGroupItem>
                  <ToggleGroupItem value="advanced">{t('difficulty.advanced')}</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('description')}</FieldLabel>
                <Input {...field} placeholder={t('description')} aria-invalid={!!fieldState.error} />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="instructions"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('instructions')}</FieldLabel>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={t('instructionsPlaceholder')}
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
