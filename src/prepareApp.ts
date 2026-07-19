/** Bootstrap hooks that must finish before the React tree mounts. */
export async function prepareApp(
  options: { isDev?: boolean } = {},
): Promise<void> {
  const isDev = options.isDev ?? import.meta.env.DEV
  if (!isDev) {
    return
  }

  const { startBrowserWorker } = await import('./mocks/browser')
  await startBrowserWorker()
}
