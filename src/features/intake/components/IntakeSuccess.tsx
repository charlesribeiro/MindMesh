import { Trans, useTranslation } from 'react-i18next'

type IntakeSuccessProps = {
  intakeId: string
  onStartOver: () => void
}

export function IntakeSuccess({ intakeId, onStartOver }: IntakeSuccessProps) {
  const { t } = useTranslation('intake')

  return (
    <div className="intake-form intake-form--success" role="status">
      <h2>{t('success.title')}</h2>
      <p>
        <Trans
          i18nKey="success.body"
          ns="intake"
          values={{ id: intakeId }}
          components={{ code: <code /> }}
        />
      </p>
      <button type="button" className="btn btn--secondary" onClick={onStartOver}>
        {t('actions.startAnother')}
      </button>
    </div>
  )
}
