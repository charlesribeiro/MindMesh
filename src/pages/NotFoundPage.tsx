import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="page">
      <h1>{t('notFound.title')}</h1>
      <p className="page__lede">{t('notFound.lede')}</p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/">
          {t('notFound.returnHome')}
        </Link>
      </div>
    </div>
  )
}
