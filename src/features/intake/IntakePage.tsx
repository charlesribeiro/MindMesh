import { useTranslation } from 'react-i18next'
import { IntakeForm, type IntakeFormProps } from './components/IntakeForm'

export type IntakePageProps = Pick<IntakeFormProps, 'submitFn'>

export function IntakePage({ submitFn }: IntakePageProps) {
  const { t } = useTranslation('intake')

  return (
    <div className="page">
      <h1>{t('page.title')}</h1>
      <p className="page__lede">{t('page.lede')}</p>
      <p className="placeholder-note">{t('page.demoNote')}</p>
      <IntakeForm submitFn={submitFn} />
    </div>
  )
}
