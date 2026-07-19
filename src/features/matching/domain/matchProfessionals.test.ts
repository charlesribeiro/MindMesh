import { describe, expect, it } from 'vitest'
import type { Professional } from '../../../domain/professionals/professional'
import type { IntakeSubmissionPayload } from '../../intake/types/intake'
import { matchProfessionals } from './matchProfessionals'
import { MATCH_POINTS } from './matchingTypes'

function baseIntake(
  overrides: Partial<IntakeSubmissionPayload> = {},
): IntakeSubmissionPayload {
  return {
    modality: 'online',
    preferredPeriods: ['morning'],
    maxSessionPrice: 150,
    supportTopic: 'anxiety',
    description: null,
    genderPreference: 'no-preference',
    preferredLanguage: 'en',
    consent: true,
    ...overrides,
  }
}

function baseProfessional(
  overrides: Partial<Professional> = {},
): Professional {
  return {
    id: 'pro-test',
    displayName: 'Test Professional',
    modalities: ['online'],
    availablePeriods: ['morning'],
    sessionPrice: 100,
    languages: ['en'],
    supportTopics: ['anxiety'],
    gender: 'not-specified',
    active: true,
    ...overrides,
  }
}

describe('matchProfessionals', () => {
  it('scores a perfect base match at 100 without gender bonus', () => {
    const intake = baseIntake()
    const professional = baseProfessional()
    const [result] = matchProfessionals(intake, [professional])

    expect(result.score).toBe(100)
    expect(result.matchedCriteria).toHaveLength(5)
    expect(result.unmatchedCriteria).toHaveLength(0)
    expect(result.matchedCriteria.map((c) => c.id)).toEqual([
      'modality',
      'period',
      'price',
      'language',
      'topic',
    ])
  })

  it('awards zero modality points when modalities do not overlap', () => {
    const [result] = matchProfessionals(baseIntake({ modality: 'online' }), [
      baseProfessional({ modalities: ['in-person'] }),
    ])

    const modality = result.unmatchedCriteria.find((c) => c.id === 'modality')
    expect(modality?.points).toBe(0)
    expect(modality?.matched).toBe(false)
    expect(result.score).toBe(70)
  })

  it('scores preferred-period overlap proportionally', () => {
    const intake = baseIntake({
      preferredPeriods: ['morning', 'afternoon', 'evening'],
    })
    const [result] = matchProfessionals(intake, [
      baseProfessional({ availablePeriods: ['morning'] }),
    ])

    const period = result.matchedCriteria.find((c) => c.id === 'period')
    expect(period?.points).toBe(Math.floor((1 * MATCH_POINTS.period) / 3))
    expect(period?.matched).toBe(true)
  })

  it('awards zero price points when the professional is above budget', () => {
    const [result] = matchProfessionals(baseIntake({ maxSessionPrice: 80 }), [
      baseProfessional({ sessionPrice: 100 }),
    ])

    const price = result.unmatchedCriteria.find((c) => c.id === 'price')
    expect(price?.points).toBe(0)
    expect(price?.matched).toBe(false)
  })

  it('awards language points when preferred language is spoken', () => {
    const [result] = matchProfessionals(
      baseIntake({ preferredLanguage: 'pt-BR' }),
      [baseProfessional({ languages: ['pt-BR', 'en'] })],
    )

    const language = result.matchedCriteria.find((c) => c.id === 'language')
    expect(language?.points).toBe(MATCH_POINTS.language)
  })

  it('awards topic points when the support topic is listed', () => {
    const [result] = matchProfessionals(baseIntake({ supportTopic: 'grief' }), [
      baseProfessional({ supportTopics: ['grief', 'anxiety'] }),
    ])

    const topic = result.matchedCriteria.find((c) => c.id === 'topic')
    expect(topic?.points).toBe(MATCH_POINTS.topic)
  })

  it('applies gender bonus only for an explicit matching preference', () => {
    const [result] = matchProfessionals(
      baseIntake({ genderPreference: 'female' }),
      [baseProfessional({ gender: 'female' })],
    )

    expect(result.score).toBe(105)
    const gender = result.matchedCriteria.find((c) => c.id === 'gender')
    expect(gender?.points).toBe(MATCH_POINTS.genderBonus)
  })

  it('omits gender criterion when intake has no gender preference', () => {
    const [result] = matchProfessionals(
      baseIntake({ genderPreference: 'no-preference' }),
      [baseProfessional({ gender: 'female' })],
    )

    expect(result.score).toBe(100)
    expect(result.matchedCriteria.some((c) => c.id === 'gender')).toBe(false)
    expect(result.unmatchedCriteria.some((c) => c.id === 'gender')).toBe(false)
  })

  it('excludes inactive professionals', () => {
    const results = matchProfessionals(baseIntake(), [
      baseProfessional({ id: 'pro-active', active: true }),
      baseProfessional({
        id: 'pro-inactive',
        active: false,
        sessionPrice: 10,
      }),
    ])

    expect(results).toHaveLength(1)
    expect(results[0]?.professional.id).toBe('pro-active')
  })

  it('breaks ties by lower session price then stable professional id', () => {
    const intake = baseIntake({
      modality: 'no-preference',
      preferredLanguage: 'no-preference',
      preferredPeriods: ['morning'],
    })
    const results = matchProfessionals(intake, [
      baseProfessional({
        id: 'pro-b',
        sessionPrice: 100,
        modalities: ['online'],
        availablePeriods: ['morning'],
        languages: ['en'],
        supportTopics: ['anxiety'],
      }),
      baseProfessional({
        id: 'pro-a',
        sessionPrice: 100,
        modalities: ['online'],
        availablePeriods: ['morning'],
        languages: ['en'],
        supportTopics: ['anxiety'],
      }),
      baseProfessional({
        id: 'pro-cheap',
        sessionPrice: 90,
        modalities: ['online'],
        availablePeriods: ['morning'],
        languages: ['en'],
        supportTopics: ['anxiety'],
      }),
    ])

    expect(results.map((r) => r.professional.id)).toEqual([
      'pro-cheap',
      'pro-a',
      'pro-b',
    ])
    expect(results.every((r) => r.score === 100)).toBe(true)
  })

  it('returns an empty list when there are no professionals', () => {
    expect(matchProfessionals(baseIntake(), [])).toEqual([])
  })

  it('does not mutate the input professionals array', () => {
    const professionals = [
      baseProfessional({ id: 'pro-z', sessionPrice: 200 }),
      baseProfessional({ id: 'pro-a', sessionPrice: 50 }),
    ]
    const snapshot = professionals.map((p) => p.id)

    matchProfessionals(baseIntake({ maxSessionPrice: 300 }), professionals)

    expect(professionals.map((p) => p.id)).toEqual(snapshot)
  })

  it('produces identical ordered results across repeated executions', () => {
    const intake = baseIntake({
      preferredPeriods: ['morning', 'evening'],
      maxSessionPrice: 130,
    })
    const professionals = [
      baseProfessional({
        id: 'pro-2',
        sessionPrice: 120,
        availablePeriods: ['evening'],
      }),
      baseProfessional({
        id: 'pro-1',
        sessionPrice: 110,
        availablePeriods: ['morning', 'evening'],
      }),
      baseProfessional({
        id: 'pro-3',
        active: false,
        sessionPrice: 10,
      }),
    ]

    const first = matchProfessionals(intake, professionals)
    const second = matchProfessionals(intake, professionals)

    expect(second).toEqual(first)
    expect(first.map((r) => r.professional.id)).toEqual(['pro-1', 'pro-2'])
  })

  it('does not penalize no-preference modality or language', () => {
    const [result] = matchProfessionals(
      baseIntake({
        modality: 'no-preference',
        preferredLanguage: 'no-preference',
      }),
      [
        baseProfessional({
          modalities: ['in-person'],
          languages: ['es'],
        }),
      ],
    )

    expect(
      result.matchedCriteria.find((c) => c.id === 'modality')?.points,
    ).toBe(MATCH_POINTS.modality)
    expect(
      result.matchedCriteria.find((c) => c.id === 'language')?.points,
    ).toBe(MATCH_POINTS.language)
  })
})
