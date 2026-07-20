import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export function CurrentUserMenu() {
  const { t } = useTranslation('auth')
  const { user, status, logout } = useAuth()

  if (status === 'loading') {
    return (
      <span className="auth-user" role="status">
        {t('loadingSession')}
      </span>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="auth-user">
      <span className="auth-user__label">
        {t('signedInAs', { name: user.displayName, role: t(`roles.${user.role}`) })}
      </span>
      <button
        type="button"
        className="btn btn--secondary auth-user__logout"
        onClick={() => {
          void logout()
        }}
      >
        {t('signOut')}
      </button>
    </div>
  )
}
