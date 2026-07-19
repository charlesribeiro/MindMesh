import { describe, expect, it } from 'vitest'
import { formatSessionPrice } from './formatIntake'

describe('formatSessionPrice', () => {
  it('formats USD for English locales', () => {
    expect(formatSessionPrice(120, 'en')).toMatch(/\$120/)
  })

  it('formats USD for Brazilian Portuguese locales', () => {
    const formatted = formatSessionPrice(120, 'pt-BR')
    expect(formatted).toContain('120')
    expect(formatted).toMatch(/US\$|USD|\$/)
  })
})
