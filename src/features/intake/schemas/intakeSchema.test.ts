import { describe, expect, it } from 'vitest'
import {
  intakeFormSchema,
  preferencesStepSchema,
  toSubmissionPayload,
} from './intakeSchema'

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
      expect(messages).toContain('validation.invalidPrice')
    }
  })

  it('accepts a complete intake payload and maps description null', () => {
    const result = intakeFormSchema.safeParse({
      modality: 'in-person',
      preferredPeriods: ['afternoon'],
      maxSessionPrice: '90',
      supportTopic: 'relationships',
      description: '   ',
      genderPreference: 'no-preference',
      preferredLanguage: 'pt-BR',
      consent: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(toSubmissionPayload(result.data).description).toBeNull()
    }
  })
})
