import type { RefObject } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { IntakeFormValues } from '../types/intake'
import {
  modalityLabelKeys,
  modalityOptions,
  periodLabelKeys,
  periodOptions,
  translateIntakeMessage,
} from '../schemas/intakeSchema'

type PreferencesStepProps = {
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function PreferencesStep({ headingRef }: PreferencesStepProps) {
  const { t } = useTranslation('intake')
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormValues>()

  return (
    <div className="intake-step">
      <h2 ref={headingRef} tabIndex={-1} className="intake-step__heading">
        {t('steps.preferences')}
      </h2>
      <p className="intake-step__lede">{t('preferences.lede')}</p>

      <fieldset className="intake-fieldset">
        <legend id="modality-legend">{t('fields.modality')}</legend>
        <div
          className="intake-options"
          role="radiogroup"
          aria-labelledby="modality-legend"
          aria-invalid={errors.modality ? true : undefined}
          aria-describedby={errors.modality ? 'modality-error' : undefined}
        >
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
        <legend id="periods-legend">{t('fields.preferredPeriods')}</legend>
        <p className="intake-hint" id="periods-hint">
          {t('fields.preferredPeriodsHint')}
        </p>
        <div
          className="intake-options"
          role="group"
          aria-labelledby="periods-legend"
          aria-describedby={
            errors.preferredPeriods
              ? 'periods-hint periods-error'
              : 'periods-hint'
          }
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
          <p className="intake-error" role="alert" id="periods-error">
            {translateIntakeMessage(t, errors.preferredPeriods.message)}
          </p>
        ) : null}
      </fieldset>

      <div className="intake-field">
        <label htmlFor="maxSessionPrice">{t('fields.maximumPrice')}</label>
        <input
          id="maxSessionPrice"
          type="number"
          inputMode="decimal"
          min={1}
          max={2000}
          step={1}
          aria-invalid={errors.maxSessionPrice ? true : undefined}
          aria-describedby={
            errors.maxSessionPrice
              ? 'maxSessionPrice-hint maxSessionPrice-error'
              : 'maxSessionPrice-hint'
          }
          {...register('maxSessionPrice')}
        />
        <p className="intake-hint" id="maxSessionPrice-hint">
          {t('fields.maximumPriceHint')}
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
