import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('MSW browser worker', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.doUnmock('msw/browser')
    vi.doUnmock('../prepareApp')
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

  it('awaits the guarded worker startup from the main bootstrap path', async () => {
    const startBrowserWorker = vi.fn(async () => undefined)
    vi.doMock('./browser', () => ({ startBrowserWorker }))

    const { prepareApp } = await import('../prepareApp')
    await prepareApp({ isDev: true })

    expect(startBrowserWorker).toHaveBeenCalledOnce()
  })

  it('skips worker startup from the main bootstrap path outside development', async () => {
    const startBrowserWorker = vi.fn(async () => undefined)
    vi.doMock('./browser', () => ({ startBrowserWorker }))

    const { prepareApp } = await import('../prepareApp')
    await prepareApp({ isDev: false })

    expect(startBrowserWorker).not.toHaveBeenCalled()
  })
})
