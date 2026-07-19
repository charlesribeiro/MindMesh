import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { professionalFixtures } from '../domain/professionals/professionalFixtures'
import { formatSessionPrice } from '../features/intake/utils/formatIntake'

export function CoordinatorPage() {
  const { t, i18n } = useTranslation(['pages', 'common'])
  const activeProfessionals = professionalFixtures.filter((p) => p.active)

  return (
    <div className="page">
      <h1>{t('pages:coordinator.title')}</h1>
      <p className="page__lede">{t('pages:coordinator.lede')}</p>
      <p className="placeholder-note">{t('pages:coordinator.demoNote')}</p>

      <h2>{t('pages:coordinator.sampleProfessionals')}</h2>
      <ul>
        {activeProfessionals.map((professional) => (
          <li key={professional.id}>
            {professional.displayName} —{' '}
            {formatSessionPrice(professional.sessionPrice, i18n.language)} /{' '}
            {t('pages:coordinator.session')} (
            {professional.active
              ? t('pages:coordinator.status.active')
              : t('pages:coordinator.status.inactive')}
            )
          </li>
        ))}
      </ul>

      <div className="page-actions">
        <Link className="btn btn--secondary" to="/intake/review">
          {t('pages:coordinator.backToReview')}
        </Link>
        <Link className="btn btn--secondary" to="/">
          {t('common:actions.home')}
        </Link>
      </div>
    </div>
  )
}
