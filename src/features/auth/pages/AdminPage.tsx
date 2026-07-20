import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  adminOverviewRequest,
  type AdminOverview,
} from '../api/authApi'
import { AuthApiError, authErrorI18nKey } from '../api/authErrors'
import { useAuth } from '../hooks/useAuth'

export function AdminPage() {
  const { t } = useTranslation(['auth', 'pages'])
  const { user } = useAuth()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminOverviewRequest()
        if (!cancelled) {
          setOverview(data)
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof AuthApiError) {
            setError(t(`auth:${authErrorI18nKey(err.kind)}`))
          } else {
            setError(t('auth:error.unexpected'))
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  return (
    <div className="page">
      <h1>{t('auth:admin.title')}</h1>
      <p className="page__lede">{t('auth:admin.lede')}</p>
      {user ? (
        <p>
          {t('auth:signedInAs', {
            name: user.displayName,
            role: t(`auth:roles.${user.role}`),
          })}
        </p>
      ) : null}

      {loading ? <p role="status">{t('auth:loadingSession')}</p> : null}
      {error ? (
        <p role="alert" className="login-form__error">
          {error}
        </p>
      ) : null}
      {overview ? (
        <ul>
          <li>
            {t('auth:admin.professionalCount', {
              count: overview.professionalCount,
            })}
          </li>
          <li>
            {t('auth:admin.activeProfessionalCount', {
              count: overview.activeProfessionalCount,
            })}
          </li>
          <li>
            {t('auth:admin.clientUserCount', { count: overview.clientUserCount })}
          </li>
          <li>
            {t('auth:admin.adminUserCount', { count: overview.adminUserCount })}
          </li>
        </ul>
      ) : null}
    </div>
  )
}
