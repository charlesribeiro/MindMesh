import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import i18n from '../i18n'
import { resetMswAuthSession } from '../mocks/handlers'
import { server } from '../mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(async () => {
  localStorage.removeItem('mindmesh-language')
  resetMswAuthSession()
  await i18n.changeLanguage('en')
})

afterEach(() => {
  server.resetHandlers()
  resetMswAuthSession()
  cleanup()
})

afterAll(() => {
  server.close()
})
