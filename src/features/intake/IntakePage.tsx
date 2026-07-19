import { useTranslation } from 'react-i18next'
import { IntakeForm } from './components/IntakeForm'

export function IntakePage() {
  const { t } = useTranslation('intake')

  return (
    <div className="page">
      <h1>{t('page.title')}</h1>
      <p className="page__lede">{t('page.lede')}</p>
      <p className="placeholder-note">{t('page.demoNote')}</p>
      <IntakeForm />
    </div>
  )
}
