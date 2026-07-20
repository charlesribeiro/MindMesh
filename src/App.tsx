import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/hooks/AuthProvider'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { RoleGuard } from './features/auth/components/RoleGuard'
import { LoginPage } from './features/auth/pages/LoginPage'
import { AdminPage } from './features/auth/pages/AdminPage'
import { IntakePage } from './features/intake/IntakePage'
import { MatchingResultsPage } from './features/matching/MatchingResultsPage'
import { AppLayout } from './layouts/AppLayout'
import { CoordinatorPage } from './pages/CoordinatorPage'
import { IntakeReviewPage } from './pages/IntakeReviewPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route
              path="intake"
              element={
                <ProtectedRoute>
                  <IntakePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="intake/review"
              element={
                <ProtectedRoute>
                  <IntakeReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="matches"
              element={
                <ProtectedRoute>
                  <MatchingResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <RoleGuard role="admin">
                  <AdminPage />
                </RoleGuard>
              }
            />
            <Route
              path="coordinator"
              element={
                <RoleGuard role="admin">
                  <CoordinatorPage />
                </RoleGuard>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
