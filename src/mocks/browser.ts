import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startBrowserWorker(
  shouldStart: boolean = import.meta.env.DEV,
): Promise<void> {
  if (!shouldStart) {
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}
