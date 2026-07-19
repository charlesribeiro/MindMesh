import { useEffect, useId, useRef, useState } from 'react'
import {
  FormProvider,
  useForm,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  SubmitIntakeApiError,
  submitIntakeErrorI18nKey,
} from '../../../graphql/errors'
import { IntakeProgress } from './IntakeProgress'
import { IntakeReviewStep } from './IntakeReviewStep'
import { IntakeSuccess } from './IntakeSuccess'
import { PreferencesStep } from './PreferencesStep'
import { SupportNeedsStep } from './SupportNeedsStep'
import { submitIntake } from '../api/submitIntake'
import {
  intakeFormDefaultValues,
  intakeFormSchema,
  stepFieldNames,
  type IntakeFormParsed,
} from '../schemas/intakeSchema'
import type { IntakeFormValues, SubmissionState } from '../types/intake'
import '../IntakeForm.css'

const TOTAL_STEPS = 3

export function IntakeForm() {
  const { t } = useTranslation('intake')
  const [step, setStep] = useState(0)
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const statusId = useId()
  const lastAnnouncedErrorRef = useRef<string | null>(null)

  const methods = useForm<IntakeFormValues, unknown, IntakeFormParsed>({
    resolver: zodResolver(
      intakeFormSchema,
    ) as Resolver<IntakeFormValues, unknown, IntakeFormParsed>,
    defaultValues: intakeFormDefaultValues,
    mode: 'onTouched',
  })

  const { handleSubmit, trigger, reset } = methods
  const isSubmitting = submission.status === 'submitting'

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    if (submission.status !== 'error') {
      return
    }

    if (lastAnnouncedErrorRef.current === submission.message) {
      return
    }

    lastAnnouncedErrorRef.current = submission.message
    errorSummaryRef.current?.focus({ preventScroll: true })
  }, [submission])

  async function goNext() {
    const fields = [...stepFieldNames[step]]
    const valid = await trigger(fields)
    if (!valid) {
      return
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1))
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0))
  }

  function goToStep(stepIndex: number) {
    setStep(stepIndex)
  }

  const onSubmit: SubmitHandler<IntakeFormParsed> = async (values) => {
    if (submission.status === 'submitting') {
      return
    }

    setSubmission({ status: 'submitting' })

    try {
      const result = await submitIntake(values)
      lastAnnouncedErrorRef.current = null
      setSubmission({
        status: 'success',
        intakeId: result.intakeId,
        intake: result.intake,
        matches: result.matches,
      })
    } catch (error) {
      const kind =
        error instanceof SubmitIntakeApiError ? error.kind : 'unexpected'
      const message = t(submitIntakeErrorI18nKey(kind))
      setSubmission({
        status: 'error',
        message,
        kind,
      })
    }
  }

  function startOver() {
    reset(intakeFormDefaultValues)
    setStep(0)
    setSubmission({ status: 'idle' })
    lastAnnouncedErrorRef.current = null
  }

  if (submission.status === 'success') {
    return (
      <IntakeSuccess
        intakeId={submission.intakeId}
        intake={submission.intake}
        matches={submission.matches}
        onStartOver={startOver}
      />
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        className="intake-form"
        noValidate
        onSubmit={(event) => {
          if (step < TOTAL_STEPS - 1) {
            event.preventDefault()
            void goNext()
            return
          }

          void handleSubmit(onSubmit)(event)
        }}
        aria-busy={isSubmitting}
      >
        <IntakeProgress currentStep={step} />

        {step === 0 ? <PreferencesStep headingRef={headingRef} /> : null}
        {step === 1 ? <SupportNeedsStep headingRef={headingRef} /> : null}
        {step === 2 ? (
          <IntakeReviewStep headingRef={headingRef} onEditStep={goToStep} />
        ) : null}

        <div
          id={statusId}
          className="intake-status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSubmitting ? <p>{t('status.submitting')}</p> : null}
        </div>

        {submission.status === 'error' ? (
          <div
            ref={errorSummaryRef}
            className="intake-error-summary"
            role="alert"
            tabIndex={-1}
          >
            <p className="intake-error">{submission.message}</p>
            <p className="intake-hint">{t('error.retryHint')}</p>
          </div>
        ) : null}

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

          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                void goNext()
              }}
              disabled={isSubmitting}
            >
              {t('actions.next')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('actions.submitting')
                : submission.status === 'error'
                  ? t('actions.retry')
                  : t('actions.submit')}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
