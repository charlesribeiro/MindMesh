import { useEffect, useId, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import './AppLayout.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/intake', label: 'Intake', end: true },
  { to: '/intake/review', label: 'Review', end: true },
  { to: '/coordinator', label: 'Coordinator', end: true },
] as const

const titles: Record<string, string> = {
  '/': 'MindMesh',
  '/intake': 'MindMesh · Intake',
  '/intake/review': 'MindMesh · Intake review',
  '/coordinator': 'MindMesh · Coordinator',
}

export function AppLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const navId = useId()

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    const title = titles[location.pathname] ?? 'MindMesh · Page not found'
    document.title = title
  }, [location.pathname])

  useEffect(() => {
    const main = document.getElementById('main-content')
    const heading = main?.querySelector('h1')
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [location.pathname])

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
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <Link className="app-brand" to="/">
            MindMesh
          </Link>

          <button
            type="button"
            className="app-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls={navId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="visually-hidden">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
            <span className="app-nav__toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <nav aria-label="Primary">
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
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <p>
            MindMesh is a fictional demo for administrative intake and
            professional matching. Matching results are suggestions, not clinical
            recommendations.
          </p>
        </div>
      </footer>
    </div>
  )
}
