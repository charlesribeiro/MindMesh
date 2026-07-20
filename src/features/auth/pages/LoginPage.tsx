import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

function resolvePostLoginPath(
  from: unknown,
  role: 'client' | 'admin',
): string {
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    if (from !== '/login') {
      return from
    }
  }
  return role === 'admin' ? '/admin' : '/intake'
}

export function LoginPage() {
  const { t } = useTranslation('auth')
  const { status, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { from?: unknown } | null

  if (status === 'loading') {
    return (
      <div className="page" role="status" aria-live="polite">
        <p>{t('loadingSession')}</p>
      </div>
    )
  }

  if (status === 'authenticated' && user) {
    return (
      <Navigate
        to={resolvePostLoginPath(state?.from, user.role)}
        replace
      />
    )
  }

  return (
    <div className="page">
      <h1>{t('title')}</h1>
      <p className="page__lede">{t('lede')}</p>
      <LoginForm
        onSuccess={() => {
          // Role is available after login via a fresh navigate using location state;
          // default destination is intake; form onSuccess runs after AuthProvider updates.
          const path =
            typeof state?.from === 'string' &&
            state.from.startsWith('/') &&
            !state.from.startsWith('//') &&
            state.from !== '/login'
              ? state.from
              : '/intake'
          void navigate(path, { replace: true })
        }}
      />
    </div>
  )
}
