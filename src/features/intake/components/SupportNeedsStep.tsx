import type { RefObject } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../types/intake'
import {
  genderPreferenceLabelKeys,
  genderPreferenceOptions,
  preferredLanguageLabelKeys,
  preferredLanguageOptions,
  supportTopicLabelKeys,
  supportTopicOptions,
  translateIntakeMessage,
} from '../schemas/intakeSchema'

type SupportNeedsStepProps = {
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function SupportNeedsStep({ headingRef }: SupportNeedsStepProps) {
  const { t } = useTranslation('intake')
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  return (
    <div className="intake-step">
      <h2 ref={headingRef} tabIndex={-1} className="intake-step__heading">
        {t('steps.supportNeeds')}
      </h2>
      <p className="intake-step__lede">{t('supportNeeds.lede')}</p>

      <div className="intake-field">
        <label htmlFor="supportTopic">{t('fields.supportTopic')}</label>
        <select
          id="supportTopic"
          aria-invalid={errors.supportTopic ? true : undefined}
          aria-describedby={errors.supportTopic ? 'supportTopic-error' : undefined}
          {...register('supportTopic')}
        >
          <option value="">{t('fields.supportTopicPlaceholder')}</option>
          {supportTopicOptions.map((value) => (
            <option key={value} value={value}>
              {t(supportTopicLabelKeys[value])}
            </option>
          ))}
        </select>
        {errors.supportTopic ? (
          <p className="intake-error" role="alert" id="supportTopic-error">
            {translateIntakeMessage(t, errors.supportTopic.message)}
          </p>
        ) : null}
      </div>

      <div className="intake-field">
        <label htmlFor="description">{t('fields.description')}</label>
        <textarea
          id="description"
          rows={5}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description
              ? 'description-hint description-error'
              : 'description-hint'
          }
          {...register('description')}
        />
        <p className="intake-hint" id="description-hint">
          {t('fields.descriptionHint')}
        </p>
        {errors.description ? (
          <p className="intake-error" role="alert" id="description-error">
            {translateIntakeMessage(t, errors.description.message)}
          </p>
        ) : null}
      </div>

      <fieldset className="intake-fieldset">
        <legend id="gender-legend">{t('fields.genderPreference')}</legend>
        <div
          className="intake-options"
          role="radiogroup"
          aria-labelledby="gender-legend"
        >
          {genderPreferenceOptions.map((value) => (
            <label key={value} className="intake-option">
              <input
                type="radio"
                value={value}
                {...register('genderPreference')}
              />
              <span>{t(genderPreferenceLabelKeys[value])}</span>
            </label>
          ))}
        </div>
        {errors.genderPreference ? (
          <p className="intake-error" role="alert">
            {translateIntakeMessage(t, errors.genderPreference.message)}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="intake-fieldset">
        <legend id="language-legend">{t('fields.preferredLanguage')}</legend>
        <div
          className="intake-options"
          role="radiogroup"
          aria-labelledby="language-legend"
        >
          {preferredLanguageOptions.map((value) => (
            <label key={value} className="intake-option">
              <input
                type="radio"
                value={value}
                {...register('preferredLanguage')}
              />
              <span>{t(preferredLanguageLabelKeys[value])}</span>
            </label>
          ))}
        </div>
        {errors.preferredLanguage ? (
          <p className="intake-error" role="alert">
            {translateIntakeMessage(t, errors.preferredLanguage.message)}
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}
