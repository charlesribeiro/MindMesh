import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../domain/intake'
import {
  genderPreferenceLabelKeys,
  genderPreferenceOptions,
  reasonLabelKeys,
  reasonOptions,
  translateIntakeMessage,
} from './schema'

export function SupportNeedsStep() {
  const { t } = useTranslation('intake')
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  return (
    <div className="intake-step">
      <h2>{t('supportNeeds.title')}</h2>
      <p className="intake-step__lede">{t('supportNeeds.lede')}</p>

      <div className="intake-field">
        <label htmlFor="reason">{t('supportNeeds.reason')}</label>
        <select
          id="reason"
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? 'reason-error' : undefined}
          {...register('reason')}
        >
          <option value="">{t('supportNeeds.selectReason')}</option>
          {reasonOptions.map((value) => (
            <option key={value} value={value}>
              {t(reasonLabelKeys[value])}
            </option>
          ))}
        </select>
        {errors.reason ? (
          <p className="intake-error" role="alert" id="reason-error">
            {translateIntakeMessage(t, errors.reason.message)}
          </p>
        ) : null}
      </div>

      <div className="intake-field">
        <label htmlFor="description">{t('supportNeeds.description')}</label>
        <textarea
          id="description"
          rows={5}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? 'description-error' : 'description-hint'
          }
          {...register('description')}
        />
        <p className="intake-hint" id="description-hint">
          {t('supportNeeds.descriptionHint')}
        </p>
        {errors.description ? (
          <p className="intake-error" role="alert" id="description-error">
            {translateIntakeMessage(t, errors.description.message)}
          </p>
        ) : null}
      </div>

      <fieldset className="intake-fieldset">
        <legend>{t('supportNeeds.genderPreference')}</legend>
        <div className="intake-options">
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
    </div>
  )
}
