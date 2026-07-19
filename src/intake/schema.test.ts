import { describe, expect, it } from 'vitest'
import { intakeFormSchema, preferencesStepSchema } from './schema'

describe('intake schemas', () => {
  it('rejects preferences without a period or price', () => {
    const result = preferencesStepSchema.safeParse({
      modality: 'online',
      preferredPeriods: [],
      maxSessionPrice: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('validation.preferredPeriodsMin')
      expect(messages).toContain('validation.maxPriceRequired')
    }
  })

  it('accepts a complete intake payload', () => {
    const result = intakeFormSchema.safeParse({
      modality: 'in-person',
      preferredPeriods: ['afternoon'],
      maxSessionPrice: '90',
      reason: 'relationships',
      description:
        'Looking for administrative matching around relationship communication support.',
      genderPreference: 'no-preference',
      consent: true,
    })

    expect(result.success).toBe(true)
  })
})
