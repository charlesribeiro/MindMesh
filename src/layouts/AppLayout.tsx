import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import './AppLayout.css'

const navItems = [
  { to: '/', labelKey: 'home', end: true },
  { to: '/intake', labelKey: 'intake', end: true },
  { to: '/intake/review', labelKey: 'review', end: true },
  { to: '/matches', labelKey: 'matches', end: true },
  { to: '/coordinator', labelKey: 'coordinator', end: true },
] as const

const documentTitleKeys: Record<string, string> = {
  '/': 'home.documentTitle',
  '/intake': 'intake.documentTitle',
  '/intake/review': 'intakeReview.documentTitle',
  '/matches': 'matches.documentTitle',
  '/coordinator': 'coordinator.documentTitle',
}

function PrimaryNav() {
  const { t } = useTranslation(['common', 'navigation'])
  const [menuOpen, setMenuOpen] = useState(false)
  const navId = useId()

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <button
        type="button"
        className="app-nav__toggle"
        aria-expanded={menuOpen}
        aria-controls={navId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="visually-hidden">
          {menuOpen
            ? t('common:accessibility.closeMenu')
            : t('common:accessibility.openMenu')}
        </span>
        <span className="app-nav__toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <nav aria-label={t('common:accessibility.primaryNavigation')}>
        <ul
          id={navId}
          className={`app-nav__list${menuOpen ? ' app-nav__list--open' : ''}`}
        >
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className="app-nav__link"
                onClick={() => setMenuOpen(false)}
              >
                {t(`navigation:${item.labelKey}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export function AppLayout() {
  const location = useLocation()
  const { t, i18n } = useTranslation(['common', 'pages'])

  useEffect(() => {
    const titleKey =
      documentTitleKeys[location.pathname] ?? 'notFound.documentTitle'
    document.title = t(`pages:${titleKey}`)
  }, [location.pathname, t, i18n.language])

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language
  }, [i18n.language, i18n.resolvedLanguage])

  useEffect(() => {
    const main = document.getElementById('main-content')
    const heading = main?.querySelector('h1')
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [location.pathname])

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        {t('common:accessibility.skipToMain')}
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <Link className="app-brand" to="/">
            MindMesh
          </Link>
          <div className="app-header__controls">
            <LanguageSelector />
            {/* Remount on route change so the mobile menu starts closed. */}
            <PrimaryNav key={location.pathname} />
          </div>
        </div>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <p>{t('common:footer.demoDisclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}
