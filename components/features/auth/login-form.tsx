'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'

import { loginSchema, type LoginFormValues } from '@/lib/validations/auth.schema'
import { loginApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth.store'
import { useRouter } from '@/i18n/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'

export function LoginForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: LoginFormValues) {
    try {
      const res = await loginApi(data, locale)
      setAuth(res.access_token, res.profile)
      router.replace('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('invalidCredentials')
      toast.error(message)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup>
              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error || undefined}>
                    <FieldLabel>{t('phone')}</FieldLabel>
                    <Input
                      {...field}
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      autoComplete="tel"
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error || undefined}>
                    <FieldLabel>{t('password')}</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      autoComplete="current-password"
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? t('loggingIn') : t('login')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
