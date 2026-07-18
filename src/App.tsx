import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { CoordinatorPage } from './pages/CoordinatorPage'
import { IntakePage } from './pages/IntakePage'
import { IntakeReviewPage } from './pages/IntakeReviewPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="intake" element={<IntakePage />} />
          <Route path="intake/review" element={<IntakeReviewPage />} />
          <Route path="coordinator" element={<CoordinatorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
