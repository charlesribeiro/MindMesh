import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../domain/intake'
import {
  genderPreferenceLabelKeys,
  modalityLabelKeys,
  periodLabelKeys,
  reasonLabelKeys,
  translateIntakeMessage,
} from './schema'

type ReviewStepProps = {
  onEditStep: (stepIndex: number) => void
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { t } = useTranslation('intake')
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  const values = watch()
  const reasonLabel =
    values.reason === ''
      ? t('review.notProvided')
      : t(reasonLabelKeys[values.reason])

  return (
    <div className="intake-step">
      <h2>{t('review.title')}</h2>
      <p className="intake-step__lede">{t('review.lede')}</p>

      <section className="intake-review-block" aria-labelledby="review-preferences">
        <div className="intake-review-block__header">
          <h3 id="review-preferences">{t('steps.preferences')}</h3>
          <button
            type="button"
            className="intake-edit-link"
            onClick={() => onEditStep(0)}
          >
            {t('review.editPreferences')}
          </button>
        </div>
        <dl className="intake-review-list">
          <div>
            <dt>{t('review.sessionFormat')}</dt>
            <dd>{t(modalityLabelKeys[values.modality])}</dd>
          </div>
          <div>
            <dt>{t('review.preferredPeriods')}</dt>
            <dd>
              {values.preferredPeriods.length > 0
                ? values.preferredPeriods
                    .map((period) => t(periodLabelKeys[period]))
                    .join(', ')
                : t('review.noneSelected')}
            </dd>
          </div>
          <div>
            <dt>{t('review.maxPrice')}</dt>
            <dd>
              {values.maxSessionPrice === '' ||
              values.maxSessionPrice === undefined
                ? t('review.notProvided')
                : `$${values.maxSessionPrice}`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="intake-review-block" aria-labelledby="review-support">
        <div className="intake-review-block__header">
          <h3 id="review-support">{t('steps.supportNeeds')}</h3>
          <button
            type="button"
            className="intake-edit-link"
            onClick={() => onEditStep(1)}
          >
            {t('review.editSupportNeeds')}
          </button>
        </div>
        <dl className="intake-review-list">
          <div>
            <dt>{t('review.generalReason')}</dt>
            <dd>{reasonLabel}</dd>
          </div>
          <div>
            <dt>{t('review.description')}</dt>
            <dd className="intake-review-list__multiline">
              {values.description.trim() || t('review.notProvided')}
            </dd>
          </div>
          <div>
            <dt>{t('review.genderPreference')}</dt>
            <dd>{t(genderPreferenceLabelKeys[values.genderPreference])}</dd>
          </div>
        </dl>
      </section>

      <fieldset className="intake-fieldset">
        <legend>{t('review.consentLegend')}</legend>
        <label className="intake-option intake-option--consent">
          <input
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-error' : 'consent-hint'}
            {...register('consent')}
          />
          <span>{t('review.consentLabel')}</span>
        </label>
        <p className="intake-hint" id="consent-hint">
          {t('review.consentHint')}
        </p>
        {errors.consent ? (
          <p className="intake-error" role="alert" id="consent-error">
            {translateIntakeMessage(t, errors.consent.message)}
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}
