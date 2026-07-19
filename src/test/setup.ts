import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import i18n from '../i18n'

beforeEach(async () => {
  localStorage.removeItem('mindmesh-language')
  await i18n.changeLanguage('en')
})

afterEach(() => {
  cleanup()
})
