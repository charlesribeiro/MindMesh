import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('MSW browser worker', () => {
  it('only starts the browser worker in development mode', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, './browser.ts'),
      'utf8',
    )

    expect(source).toContain('import.meta.env.DEV')
    expect(source).toMatch(/if\s*\(\s*!import\.meta\.env\.DEV\s*\)/)
  })

  it('starts the worker from main only in development', () => {
    const source = readFileSync(
      resolve(import.meta.dirname, '../main.tsx'),
      'utf8',
    )

    expect(source).toContain('import.meta.env.DEV')
    expect(source).toContain('./mocks/browser')
  })
})
