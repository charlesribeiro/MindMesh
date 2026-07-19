/** Bootstrap hooks that must finish before the React tree mounts. */
export async function prepareApp(
  options: {
    isDev?: boolean
    useMockApi?: boolean
  } = {},
): Promise<void> {
  const isDev = options.isDev ?? import.meta.env.DEV
  const useMockApi =
    options.useMockApi ?? import.meta.env.VITE_USE_MOCK_API === 'true'

  if (!isDev || !useMockApi) {
    return
  }

  const { startBrowserWorker } = await import('./mocks/browser')
  await startBrowserWorker()
}
