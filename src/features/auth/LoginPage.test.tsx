import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleGuard } from './components/RoleGuard'
import { LoginPage } from './pages/LoginPage'
import { setMswAuthSession } from '../../mocks/handlers'

function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button type="button" onClick={() => void logout()}>
      Sign out
    </button>
  )
}

describe('auth UI', () => {
  it('validates the login form', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  })

  it('signs in successfully as a client', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/intake" element={<div>Intake content</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Email'), 'client@mindmesh.local')
    await user.type(
      screen.getByLabelText('Password'),
      'MindMesh-Client-Dev-1!',
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Intake content')).toBeInTheDocument()
  })

  it('shows invalid credentials for a bad password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Email'), 'client@mindmesh.local')
    await user.type(screen.getByLabelText('Password'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument()
  })

  it('redirects anonymous users from protected routes to login', async () => {
    render(
      <MemoryRouter initialEntries={['/intake']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/intake"
              element={
                <ProtectedRoute>
                  <div>Intake content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })

  it('renders protected content for an authenticated client', async () => {
    setMswAuthSession('client')
    render(
      <MemoryRouter initialEntries={['/intake']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/intake"
              element={
                <ProtectedRoute>
                  <div>Intake content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Intake content')).toBeInTheDocument()
  })

  it('rejects clients from the admin route', async () => {
    setMswAuthSession('client')
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleGuard role="admin">
                  <div>Admin content</div>
                </RoleGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument()
  })

  it('allows admins on the admin route', async () => {
    setMswAuthSession('admin')
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleGuard role="admin">
                  <div>Admin content</div>
                </RoleGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Admin content')).toBeInTheDocument()
  })

  it('restores the original destination after login', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/login', state: { from: '/matches' } },
        ]}
      >
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/matches" element={<div>Matches content</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Email'), 'client@mindmesh.local')
    await user.type(
      screen.getByLabelText('Password'),
      'MindMesh-Client-Dev-1!',
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Matches content')).toBeInTheDocument()
  })

  it('logs out and returns the user to the login screen', async () => {
    setMswAuthSession('client')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/intake']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/intake"
              element={
                <ProtectedRoute>
                  <div>
                    Intake content
                    <LogoutButton />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Intake content')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })
})
