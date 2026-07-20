import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { AuthApiError, authErrorI18nKey } from '../api/authErrors'
import { loginFormSchema, type LoginFormValues } from '../schemas/loginSchema'
import { useAuth } from '../hooks/useAuth'
import './LoginForm.css'

type LoginFormProps = {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation('auth')
  const { login } = useAuth()
  const errorId = useId()
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (submitError) {
      errorRef.current?.focus()
    }
  }, [submitError])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await login(values)
      onSuccess()
    } catch (error) {
      if (error instanceof AuthApiError) {
        setSubmitError(t(authErrorI18nKey(error.kind)))
        return
      }
      setSubmitError(t('error.unexpected'))
    }
  })

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {submitError ? (
        <p
          ref={errorRef}
          id={errorId}
          className="login-form__error"
          role="alert"
          tabIndex={-1}
        >
          {submitError}
        </p>
      ) : null}

      <div className="login-form__field">
        <label htmlFor="login-email">{t('fields.email')}</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={
            errors.email
              ? 'login-email-error'
              : submitError
                ? errorId
                : undefined
          }
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email?.message ? (
          <p id="login-email-error" className="login-form__field-error" role="alert">
            {t(errors.email.message)}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label htmlFor="login-password">{t('fields.password')}</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password ? 'login-password-error' : undefined
          }
          disabled={isSubmitting}
          {...register('password')}
        />
        {errors.password?.message ? (
          <p
            id="login-password-error"
            className="login-form__field-error"
            role="alert"
          >
            {t(errors.password.message)}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('signingIn') : t('signIn')}
      </button>

      {import.meta.env.DEV ? (
        <p className="login-form__dev-hint">{t('devCredentialHint')}</p>
      ) : null}
    </form>
  )
}
