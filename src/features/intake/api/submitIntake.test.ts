import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { resolveGraphQLEndpoint } from '../../../graphql/client'
import { SubmitIntakeApiError } from '../../../graphql/errors'
import { mapSubmitIntakeResponse } from '../../../graphql/mappers/mapSubmitIntakeResponse'
import { submitIntakeResponseSchema } from '../../../graphql/schemas/submitIntakeResponseSchema'
import { server } from '../../../mocks/server'
import { MSW_SCENARIO_HEADER } from '../../../mocks/scenarios'
import { submitIntake } from './submitIntake'

const graphqlUrl = resolveGraphQLEndpoint()

const validValues = {
  modality: 'online',
  preferredPeriods: ['morning'],
  maxSessionPrice: 120,
  supportTopic: 'work',
  description: 'Optional notes about scheduling preferences for administrative matching.',
  genderPreference: 'female',
  preferredLanguage: 'en',
  consent: true,
} as const

describe('submitIntake API', () => {
  it('submits valid mutation variables and returns mapped domain data', async () => {
    const result = await submitIntake(validValues)

    expect(result.intakeId).toMatch(/^intake-demo-[0-9a-f]+$/)
    expect(result.intake.modality).toBe('online')
    expect(result.intake.maxSessionPrice).toBe(120)
    expect(result.matches.length).toBeGreaterThan(0)
    expect(result.matches[0]?.professional.id).toBeTruthy()
    expect(result.matches[0]?.matchedCriteria.length).toBeGreaterThan(0)
  })

  it('produces a deterministic intake id for identical input', async () => {
    const first = await submitIntake(validValues)
    const second = await submitIntake(validValues)
    expect(second.intakeId).toBe(first.intakeId)
    expect(second.matches.map((m) => m.professional.id)).toEqual(
      first.matches.map((m) => m.professional.id),
    )
  })

  it('validates a successful transport response with Zod', () => {
    const sample = {
      submitIntake: {
        intake: {
          id: 'intake-demo-abc',
          modality: 'online',
          preferredPeriods: ['morning'],
          maxSessionPrice: 120,
          supportTopic: 'work',
          description: null,
          genderPreference: 'no-preference',
          preferredLanguage: 'en',
          consentedAt: '2026-01-15T12:00:00.000Z',
        },
        matches: [],
      },
    }

    const parsed = submitIntakeResponseSchema.safeParse(sample)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      const mapped = mapSubmitIntakeResponse(parsed.data)
      expect(mapped.intakeId).toBe('intake-demo-abc')
      expect(mapped.matches).toEqual([])
    }
  })

  it('rejects malformed responses', async () => {
    await expect(
      submitIntake(validValues, { scenario: 'malformed' }),
    ).rejects.toMatchObject({
      kind: 'invalid_response',
    } satisfies Partial<SubmitIntakeApiError>)
  })

  it('handles network failures', async () => {
    await expect(
      submitIntake(validValues, { scenario: 'network' }),
    ).rejects.toMatchObject({
      kind: 'network',
    } satisfies Partial<SubmitIntakeApiError>)
  })

  it('handles GraphQL error responses', async () => {
    await expect(
      submitIntake(validValues, { scenario: 'graphql' }),
    ).rejects.toMatchObject({
      kind: 'graphql',
    } satisfies Partial<SubmitIntakeApiError>)
  })

  it('can override handlers for an explicit GraphQL error body', async () => {
    server.use(
      http.post(graphqlUrl, () =>
        HttpResponse.json({
          errors: [{ message: 'Forced failure' }],
        }),
      ),
    )

    await expect(submitIntake(validValues)).rejects.toMatchObject({
      kind: 'graphql',
    })
  })

  it('supports delayed responses without changing payload shape', async () => {
    const result = await submitIntake(validValues, { scenario: 'delay' })
    expect(result.intakeId).toMatch(/^intake-demo-/)
    expect(result.matches.length).toBeGreaterThan(0)
  })

  it('sends the MSW scenario header for non-default scenarios', async () => {
    let seenHeader: string | null = null

    server.use(
      http.post(graphqlUrl, async ({ request }) => {
        seenHeader = request.headers.get(MSW_SCENARIO_HEADER)
        return HttpResponse.json({
          errors: [{ message: 'stop' }],
        })
      }),
    )

    await expect(
      submitIntake(validValues, { scenario: 'graphql' }),
    ).rejects.toBeInstanceOf(SubmitIntakeApiError)

    expect(seenHeader).toBe('graphql')
  })
})
