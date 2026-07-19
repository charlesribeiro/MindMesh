import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { prepareApp } from './prepareApp'

function renderApp(): void {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void prepareApp()
  .catch((error: unknown) => {
    console.error('Failed to prepare application bootstrap', error)
  })
  .finally(() => {
    renderApp()
  })
