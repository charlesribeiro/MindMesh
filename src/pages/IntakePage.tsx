import { useTranslation } from 'react-i18next'
import { IntakeForm } from '../intake/IntakeForm'

export function IntakePage() {
  const { t } = useTranslation('pages')

  return (
    <div className="page">
      <h1>{t('intake.title')}</h1>
      <p className="page__lede">{t('intake.lede')}</p>
      <p className="placeholder-note">{t('intake.demoNote')}</p>
      <IntakeForm />
    </div>
  )
}
