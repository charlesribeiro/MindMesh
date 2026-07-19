import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Availability } from '../domain/types'
import { professionals } from '../fixtures/professionals'

const availabilityKeys: Record<Availability, string> = {
  accepting: 'coordinator.availability.accepting',
  waitlist: 'coordinator.availability.waitlist',
  unavailable: 'coordinator.availability.unavailable',
}

export function CoordinatorPage() {
  const { t } = useTranslation(['pages', 'common'])

  return (
    <div className="page">
      <h1>{t('pages:coordinator.title')}</h1>
      <p className="page__lede">{t('pages:coordinator.lede')}</p>
      <p className="placeholder-note">{t('pages:coordinator.demoNote')}</p>

      <h2>{t('pages:coordinator.sampleProfessionals')}</h2>
      <ul>
        {professionals.map((professional) => (
          <li key={professional.id}>
            {professional.displayName}, {professional.credentials} —{' '}
            {professional.locationLabel} (
            {t(`pages:${availabilityKeys[professional.availability]}`)})
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
