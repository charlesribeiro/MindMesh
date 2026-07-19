import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('MSW browser worker', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.doUnmock('msw/browser')
    vi.doUnmock('./browser')
    vi.resetModules()
  })

  it('calls worker.start when development startup is enabled', async () => {
    const start = vi.fn(async () => undefined)
    vi.doMock('msw/browser', () => ({
      setupWorker: () => ({ start }),
    }))

    const { startBrowserWorker } = await import('./browser')
    await startBrowserWorker(true)

    expect(start).toHaveBeenCalledWith({
      onUnhandledRequest: 'bypass',
      quiet: true,
    })
  })

  it('does not call worker.start when development startup is disabled', async () => {
    const start = vi.fn(async () => undefined)
    vi.doMock('msw/browser', () => ({
      setupWorker: () => ({ start }),
    }))

    const { startBrowserWorker } = await import('./browser')
    await startBrowserWorker(false)

    expect(start).not.toHaveBeenCalled()
  })

  it('awaits mocked worker startup when mock API mode is enabled', async () => {
    const startBrowserWorker = vi.fn(async () => undefined)
    vi.doMock('./browser', () => ({ startBrowserWorker }))

    const { prepareApp } = await import('../prepareApp')
    await prepareApp({ isDev: true, useMockApi: true })

    expect(startBrowserWorker).toHaveBeenCalledOnce()
  })

  it('skips worker startup when mock API mode is disabled', async () => {
    const startBrowserWorker = vi.fn(async () => undefined)
    vi.doMock('./browser', () => ({ startBrowserWorker }))

    const { prepareApp } = await import('../prepareApp')
    await prepareApp({ isDev: true, useMockApi: false })

    expect(startBrowserWorker).not.toHaveBeenCalled()
  })

  it('skips worker startup outside development even if mock API is requested', async () => {
    const startBrowserWorker = vi.fn(async () => undefined)
    vi.doMock('./browser', () => ({ startBrowserWorker }))

    const { prepareApp } = await import('../prepareApp')
    await prepareApp({ isDev: false, useMockApi: true })

    expect(startBrowserWorker).not.toHaveBeenCalled()
  })
})
