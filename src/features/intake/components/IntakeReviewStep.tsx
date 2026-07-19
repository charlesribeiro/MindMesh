import type { RefObject } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../types/intake'
import {
  genderPreferenceLabelKeys,
  modalityLabelKeys,
  periodLabelKeys,
  preferredLanguageLabelKeys,
  supportTopicLabelKeys,
  translateIntakeMessage,
} from '../schemas/intakeSchema'
import { formatSessionPrice } from '../utils/formatIntake'

type IntakeReviewStepProps = {
  headingRef: RefObject<HTMLHeadingElement | null>
  onEditStep: (stepIndex: number) => void
}

export function IntakeReviewStep({
  headingRef,
  onEditStep,
}: IntakeReviewStepProps) {
  const { t, i18n } = useTranslation('intake')
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  const values = watch()
  const supportTopicLabel =
    values.supportTopic === ''
      ? t('review.notProvided')
      : t(supportTopicLabelKeys[values.supportTopic])

  const priceLabel =
    values.maxSessionPrice === '' || values.maxSessionPrice === undefined
      ? t('review.notProvided')
      : formatSessionPrice(Number(values.maxSessionPrice), i18n.language)

  return (
    <div className="intake-step">
      <h2 ref={headingRef} tabIndex={-1} className="intake-step__heading">
        {t('review.title')}
      </h2>
      <p className="intake-step__lede">{t('review.lede')}</p>

      <section
        className="intake-review-block"
        aria-labelledby="review-preferences"
      >
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
            <dt>{t('fields.modality')}</dt>
            <dd>{t(modalityLabelKeys[values.modality])}</dd>
          </div>
          <div>
            <dt>{t('fields.preferredPeriods')}</dt>
            <dd>
              {values.preferredPeriods.length > 0
                ? values.preferredPeriods
                    .map((period) => t(periodLabelKeys[period]))
                    .join(', ')
                : t('review.noneSelected')}
            </dd>
          </div>
          <div>
            <dt>{t('fields.maximumPrice')}</dt>
            <dd>{priceLabel}</dd>
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
            <dt>{t('fields.supportTopic')}</dt>
            <dd>{supportTopicLabel}</dd>
          </div>
          <div>
            <dt>{t('fields.description')}</dt>
            <dd className="intake-review-list__multiline">
              {values.description.trim() || t('review.notProvided')}
            </dd>
          </div>
          <div>
            <dt>{t('fields.genderPreference')}</dt>
            <dd>{t(genderPreferenceLabelKeys[values.genderPreference])}</dd>
          </div>
          <div>
            <dt>{t('fields.preferredLanguage')}</dt>
            <dd>{t(preferredLanguageLabelKeys[values.preferredLanguage])}</dd>
          </div>
        </dl>
      </section>

      <section
        className="intake-review-block"
        aria-labelledby="review-privacy"
      >
        <h3 id="review-privacy">{t('review.privacyTitle')}</h3>
        <p>{t('review.privacyBody')}</p>
      </section>

      <fieldset className="intake-fieldset">
        <legend>{t('review.consentLegend')}</legend>
        <label className="intake-option intake-option--consent">
          <input
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={
              errors.consent ? 'consent-error' : undefined
            }
            {...register('consent')}
          />
          <span>{t('review.consentLabel')}</span>
        </label>
        {errors.consent ? (
          <p className="intake-error" role="alert" id="consent-error">
            {translateIntakeMessage(t, errors.consent.message)}
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}
