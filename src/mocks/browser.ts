import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startBrowserWorker(): Promise<void> {
  if (!import.meta.env.DEV) {
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}
