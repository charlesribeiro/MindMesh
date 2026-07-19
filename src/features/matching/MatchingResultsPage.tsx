import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { professionalFixtures } from '../../domain/professionals/professionalFixtures'
import { matchProfessionals } from './domain/matchProfessionals'
import { ProfessionalMatchCard } from './components/ProfessionalMatchCard'
import { parseMatchesLocationState } from './utils/parseMatchesState'
import './MatchingResultsPage.css'

export function MatchingResultsPage() {
  const { t } = useTranslation(['matching', 'common'])
  const location = useLocation()
  const parsed = parseMatchesLocationState(location.state)

  if (!parsed) {
    return (
      <div className="page matching-page">
        <h1>{t('matching:empty.title')}</h1>
        <p className="page__lede">{t('matching:empty.description')}</p>
        <div className="page-actions">
          <Link className="btn btn--primary" to="/intake">
            {t('matching:empty.startIntake')}
          </Link>
          <Link className="btn btn--secondary" to="/">
            {t('matching:actions.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  const results = matchProfessionals(parsed.intake, professionalFixtures)

  return (
    <div className="page matching-page">
      <h1>{t('matching:page.title')}</h1>
      <p className="page__lede">{t('matching:page.description')}</p>

      <aside className="matching-disclaimer" role="note">
        <p>{t('matching:disclaimer')}</p>
      </aside>

      <div
        className="matching-results__status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {t('matching:results.announcement', { count: results.length })}
      </div>

      {results.length === 0 ? (
        <p>{t('matching:results.announcement', { count: 0 })}</p>
      ) : (
        <ol className="matching-results__list">
          {results.map((result, index) => (
            <li key={result.professional.id}>
              <ProfessionalMatchCard result={result} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}

      <div className="page-actions">
        <Link className="btn btn--secondary" to="/intake">
          {t('matching:actions.startIntake')}
        </Link>
        <Link className="btn btn--secondary" to="/">
          {t('matching:actions.backHome')}
        </Link>
      </div>
    </div>
  )
}
