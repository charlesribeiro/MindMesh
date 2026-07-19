import { useId, useState } from 'react'
import {
  FormProvider,
  useForm,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useTranslation } from 'react-i18next'
import type {
  IntakeFormValues,
  IntakeSubmissionStatus,
} from '../domain/intake'
import { PreferencesStep } from './PreferencesStep'
import { ReviewStep } from './ReviewStep'
import {
  intakeFormDefaultValues,
  intakeFormSchema,
  stepFieldNames,
  type IntakeFormParsed,
} from './schema'
import { submitIntake } from './submitIntake'
import { SupportNeedsStep } from './SupportNeedsStep'
import './IntakeForm.css'

const STEP_KEYS = [
  'steps.preferences',
  'steps.supportNeeds',
  'steps.review',
] as const

export type IntakeFormProps = {
  /** Injectable for tests; defaults to the mock submit helper. */
  submitFn?: typeof submitIntake
}

export function IntakeForm({ submitFn = submitIntake }: IntakeFormProps) {
  const { t } = useTranslation('intake')
  const [step, setStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] =
    useState<IntakeSubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const statusId = useId()

  const methods = useForm<IntakeFormValues, unknown, IntakeFormParsed>({
    resolver: zodResolver(
      intakeFormSchema,
    ) as Resolver<IntakeFormValues, unknown, IntakeFormParsed>,
    defaultValues: intakeFormDefaultValues,
    mode: 'onTouched',
  })

  const { handleSubmit, trigger, reset } = methods
  const isSubmitting = submissionStatus === 'submitting'

  async function goNext() {
    const fields = [...stepFieldNames[step]]
    const valid = await trigger(fields)
    if (!valid) {
      return
    }
    setStep((current) => Math.min(current + 1, STEP_KEYS.length - 1))
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0))
  }

  function goToStep(stepIndex: number) {
    setStep(stepIndex)
  }

  const onSubmit: SubmitHandler<IntakeFormParsed> = async (values) => {
    if (isSubmitting) {
      return
    }

    setSubmissionStatus('submitting')
    setSubmissionError(null)

    try {
      const result = await submitFn(values)
      setSubmissionId(result.id)
      setSubmissionStatus('success')
    } catch {
      setSubmissionError(t('status.failed'))
      setSubmissionStatus('error')
    }
  }

  function startOver() {
    reset(intakeFormDefaultValues)
    setStep(0)
    setSubmissionStatus('idle')
    setSubmissionError(null)
    setSubmissionId(null)
  }

  if (submissionStatus === 'success') {
    return (
      <div className="intake-form intake-form--success" role="status">
        <h2>{t('status.successTitle')}</h2>
        <p>
          {submissionId ? (
            <Trans
              i18nKey="status.successBody"
              ns="intake"
              values={{ id: submissionId }}
              components={{ code: <code /> }}
            />
          ) : (
            t('status.successBodyNoId')
          )}
        </p>
        <button type="button" className="btn btn--secondary" onClick={startOver}>
          {t('actions.startAnother')}
        </button>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        className="intake-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isSubmitting}
      >
        <div className="intake-progress" aria-label={t('progressLabel')}>
          <ol className="intake-progress__list">
            {STEP_KEYS.map((labelKey, index) => {
              const state =
                index === step
                  ? 'current'
                  : index < step
                    ? 'complete'
                    : 'upcoming'
              return (
                <li
                  key={labelKey}
                  className={`intake-progress__item intake-progress__item--${state}`}
                  aria-current={index === step ? 'step' : undefined}
                >
                  <span className="intake-progress__index">{index + 1}</span>
                  <span className="intake-progress__label">{t(labelKey)}</span>
                </li>
              )
            })}
          </ol>
        </div>

        {step === 0 ? <PreferencesStep /> : null}
        {step === 1 ? <SupportNeedsStep /> : null}
        {step === 2 ? <ReviewStep onEditStep={goToStep} /> : null}

        <div
          id={statusId}
          className="intake-status"
          aria-live="polite"
          aria-atomic="true"
        >
          {submissionStatus === 'submitting' ? (
            <p>{t('status.submitting')}</p>
          ) : null}
          {submissionStatus === 'error' && submissionError ? (
            <p className="intake-error" role="alert">
              {submissionError}
            </p>
          ) : null}
        </div>

        <div className="intake-actions">
          {step > 0 ? (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={goBack}
              disabled={isSubmitting}
            >
              {t('actions.back')}
            </button>
          ) : (
            <span />
          )}

          {step < STEP_KEYS.length - 1 ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                void goNext()
              }}
              disabled={isSubmitting}
            >
              {t('actions.continue')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('actions.submitting') : t('actions.submit')}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
