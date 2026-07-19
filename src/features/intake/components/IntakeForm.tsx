import { useEffect, useId, useRef, useState } from 'react'
import {
  FormProvider,
  useForm,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { IntakeProgress } from './IntakeProgress'
import { IntakeReviewStep } from './IntakeReviewStep'
import { IntakeSuccess } from './IntakeSuccess'
import { PreferencesStep } from './PreferencesStep'
import { SupportNeedsStep } from './SupportNeedsStep'
import {
  intakeFormDefaultValues,
  intakeFormSchema,
  stepFieldNames,
  type IntakeFormParsed,
} from '../schemas/intakeSchema'
import type { IntakeFormValues, SubmissionState } from '../types/intake'
import { submitIntake } from '../utils/submitIntake'
import '../IntakeForm.css'

const TOTAL_STEPS = 3

export type IntakeFormProps = {
  submitFn?: typeof submitIntake
}

export function IntakeForm({ submitFn = submitIntake }: IntakeFormProps) {
  const { t } = useTranslation('intake')
  const [step, setStep] = useState(0)
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const statusId = useId()

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
      const result = await submitFn(values)
      setSubmission({ status: 'success', intakeId: result.id })
    } catch {
      setSubmission({
        status: 'error',
        message: t('error.submission'),
      })
    }
  }

  function startOver() {
    reset(intakeFormDefaultValues)
    setStep(0)
    setSubmission({ status: 'idle' })
  }

  if (submission.status === 'success') {
    return (
      <IntakeSuccess intakeId={submission.intakeId} onStartOver={startOver} />
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
          {submission.status === 'submitting' ? (
            <p>{t('status.submitting')}</p>
          ) : null}
          {submission.status === 'error' ? (
            <p className="intake-error" role="alert">
              {submission.message}
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
              {isSubmitting ? t('actions.submitting') : t('actions.submit')}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
