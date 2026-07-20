import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth'

type ProtectedRouteProps = {
  children: React.ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()
  const { t } = useTranslation('auth')

  if (status === 'loading') {
    return (
      <div className="page" role="status" aria-live="polite">
        <p>{t('loadingSession')}</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    )
  }

  if (role && user.role !== role) {
    return (
      <div className="page" role="alert">
        <h1>{t('forbiddenTitle')}</h1>
        <p>{t('error.forbidden')}</p>
      </div>
    )
  }

  return children
}
