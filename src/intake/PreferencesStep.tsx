import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../domain/intake'
import {
  modalityLabelKeys,
  modalityOptions,
  periodLabelKeys,
  periodOptions,
  translateIntakeMessage,
} from './schema'

export function PreferencesStep() {
  const { t } = useTranslation('intake')
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  return (
    <div className="intake-step">
      <h2>{t('preferences.title')}</h2>
      <p className="intake-step__lede">{t('preferences.lede')}</p>

      <fieldset className="intake-fieldset">
        <legend>{t('preferences.sessionFormat')}</legend>
        <div className="intake-options">
          {modalityOptions.map((value) => (
            <label key={value} className="intake-option">
              <input type="radio" value={value} {...register('modality')} />
              <span>{t(modalityLabelKeys[value])}</span>
            </label>
          ))}
        </div>
        {errors.modality ? (
          <p className="intake-error" role="alert" id="modality-error">
            {translateIntakeMessage(t, errors.modality.message)}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="intake-fieldset">
        <legend>{t('preferences.preferredPeriods')}</legend>
        <p className="intake-hint" id="periods-hint">
          {t('preferences.periodsHint')}
        </p>
        <div
          className="intake-options"
          aria-describedby="periods-hint"
          aria-invalid={errors.preferredPeriods ? true : undefined}
        >
          {periodOptions.map((value) => (
            <label key={value} className="intake-option">
              <input
                type="checkbox"
                value={value}
                {...register('preferredPeriods')}
              />
              <span>{t(periodLabelKeys[value])}</span>
            </label>
          ))}
        </div>
        {errors.preferredPeriods ? (
          <p className="intake-error" role="alert">
            {translateIntakeMessage(t, errors.preferredPeriods.message)}
          </p>
        ) : null}
      </fieldset>

      <div className="intake-field">
        <label htmlFor="maxSessionPrice">{t('preferences.maxPrice')}</label>
        <input
          id="maxSessionPrice"
          type="number"
          inputMode="decimal"
          min={1}
          max={2000}
          step={1}
          aria-invalid={errors.maxSessionPrice ? true : undefined}
          aria-describedby={
            errors.maxSessionPrice ? 'maxSessionPrice-error' : 'maxSessionPrice-hint'
          }
          {...register('maxSessionPrice')}
        />
        <p className="intake-hint" id="maxSessionPrice-hint">
          {t('preferences.maxPriceHint')}
        </p>
        {errors.maxSessionPrice ? (
          <p className="intake-error" role="alert" id="maxSessionPrice-error">
            {translateIntakeMessage(t, errors.maxSessionPrice.message)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
