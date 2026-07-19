import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'

async function prepare(): Promise<void> {
  if (import.meta.env.DEV) {
    const { startBrowserWorker } = await import('./mocks/browser')
    await startBrowserWorker()
  }
}

void prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
