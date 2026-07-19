import { useTranslation } from 'react-i18next'

const STEP_KEYS = [
  'steps.preferences',
  'steps.supportNeeds',
  'steps.review',
] as const

type IntakeProgressProps = {
  currentStep: number
}

export function IntakeProgress({ currentStep }: IntakeProgressProps) {
  const { t } = useTranslation('intake')
  const total = STEP_KEYS.length

  return (
    <div
      className="intake-progress"
      aria-label={t('progress.label')}
    >
      <p className="visually-hidden">
        {t('progress.stepOf', {
          current: currentStep + 1,
          total,
        })}
      </p>
      <ol className="intake-progress__list">
        {STEP_KEYS.map((labelKey, index) => {
          const state =
            index === currentStep
              ? 'current'
              : index < currentStep
                ? 'complete'
                : 'upcoming'

          return (
            <li
              key={labelKey}
              className={`intake-progress__item intake-progress__item--${state}`}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <span className="intake-progress__index">{index + 1}</span>
              <span className="intake-progress__label">{t(labelKey)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
