import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './LandingPage.css'

export function LandingPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="landing">
      <section className="landing__hero" aria-labelledby="landing-brand">
        <div className="landing__hero-content">
          <h1 id="landing-brand" className="landing__brand">
            MindMesh
          </h1>
          <p className="landing__tagline">{t('home.tagline')}</p>
          <div className="landing__actions">
            <Link className="btn btn--primary" to="/intake">
              {t('home.startIntake')}
            </Link>
            <Link className="btn btn--secondary" to="/coordinator">
              {t('home.coordinatorView')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
