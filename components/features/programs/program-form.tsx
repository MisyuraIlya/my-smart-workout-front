'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { programSchema, type ProgramFormValues } from '@/lib/validations/program.schema'
import { useCreateProgram, useUpdateProgram } from '@/lib/hooks/use-programs'
import type { Program } from '@/lib/api/workout'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Form, FormField } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const STATUS_INT_TO_STR: Record<number, string> = {
  0: 'inactive',
  1: 'active',
  2: 'done',
  3: 'canceled',
  4: 'inactive',
}

interface Props {
  program?: Program
  onSuccess: (id?: string) => void
}

export function ProgramForm({ program, onSuccess }: Props) {
  const t = useTranslations('programs')
  const tc = useTranslations('common')
  const createMutation = useCreateProgram()
  const updateMutation = useUpdateProgram()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program?.name ?? '',
      status: program ? (STATUS_INT_TO_STR[program.status] as ProgramFormValues['status']) : 'inactive',
      category: program?.category ?? 'strength',
      starts_on: program?.starts_on ? program.starts_on.slice(0, 10) : '',
      ends_on: program?.ends_on ? program.ends_on.slice(0, 10) : '',
    },
  })

  async function onSubmit(data: ProgramFormValues) {
    try {
      if (program) {
        await updateMutation.mutateAsync({ id: program.id, data })
        onSuccess(program.id)
      } else {
        const created = await createMutation.mutateAsync(data)
        onSuccess(created.id)
      }
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
            name="category"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t('category.label')}</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(v) => v && field.onChange(v)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="strength">{t('category.strength')}</ToggleGroupItem>
                  <ToggleGroupItem value="mass">{t('category.mass')}</ToggleGroupItem>
                  <ToggleGroupItem value="cardio">{t('category.cardio')}</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <Field>
                <FieldLabel>{t('status.label')}</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(v) => v && field.onChange(v)}
                  className="justify-start flex-wrap"
                >
                  <ToggleGroupItem value="inactive">{t('status.inactive')}</ToggleGroupItem>
                  <ToggleGroupItem value="active">{t('status.active')}</ToggleGroupItem>
                  <ToggleGroupItem value="done">{t('status.done')}</ToggleGroupItem>
                  <ToggleGroupItem value="canceled">{t('status.canceled')}</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="starts_on"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('startsOn')}</FieldLabel>
                <Input {...field} type="date" aria-invalid={!!fieldState.error} />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <FormField
            control={form.control}
            name="ends_on"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error || undefined}>
                <FieldLabel>{t('endsOn')}</FieldLabel>
                <Input {...field} type="date" aria-invalid={!!fieldState.error} />
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
