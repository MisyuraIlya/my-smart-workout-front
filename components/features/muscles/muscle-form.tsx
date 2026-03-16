'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { muscleSchema, type MuscleFormValues } from '@/lib/validations/muscle.schema'
import { useCreateMuscle, useUpdateMuscle } from '@/lib/hooks/use-muscles'
import type { Muscle } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Form, FormField } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'

interface Props {
  muscle?: Muscle
  onSuccess: () => void
}

export function MuscleForm({ muscle, onSuccess }: Props) {
  const t = useTranslations('muscles')
  const tc = useTranslations('common')
  const createMutation = useCreateMuscle()
  const updateMutation = useUpdateMuscle()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<MuscleFormValues>({
    resolver: zodResolver(muscleSchema),
    defaultValues: { name: muscle?.name ?? '' },
  })

  async function onSubmit(data: MuscleFormValues) {
    try {
      if (muscle) {
        await updateMutation.mutateAsync({ id: muscle.id, data })
      } else {
        await createMutation.mutateAsync(data)
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
        </FieldGroup>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {tc('save')}
        </Button>
      </form>
    </Form>
  )
}
