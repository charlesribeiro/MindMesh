import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function IntakeReviewPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="page">
      <h1>{t('intakeReview.title')}</h1>
      <p className="page__lede">{t('intakeReview.lede')}</p>
      <p className="placeholder-note">{t('intakeReview.demoNote')}</p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/coordinator">
          {t('intakeReview.continueToCoordinator')}
        </Link>
        <Link className="btn btn--secondary" to="/intake">
          {t('intakeReview.backToIntake')}
        </Link>
      </div>
    </div>
  )
}
