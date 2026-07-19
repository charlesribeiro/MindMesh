import { describe, expect, it } from 'vitest'
import { SUBMIT_INTAKE_MUTATION } from '../src/graphql/operations/submitIntakeOperation'
import { submitIntakeResponseSchema } from '../src/graphql/schemas/submitIntakeResponseSchema'
import { mapSubmitIntakeResponse } from '../src/graphql/mappers/mapSubmitIntakeResponse'
import { createMindMeshYoga } from './createApp'
import { DEMO_CONSENTED_AT } from '../src/domain/intake/buildSubmitIntakeResult'
import { stableHash } from '../src/domain/stableHash'

const validInput = {
  modality: 'online',
  preferredPeriods: ['morning', 'afternoon'],
  maxSessionPrice: 150,
  supportTopic: 'anxiety',
  description: 'Looking for administrative matching support.',
  genderPreference: 'no-preference',
  preferredLanguage: 'en',
  consent: true,
} as const

async function postGraphql(body: unknown): Promise<Response> {
  const yoga = createMindMeshYoga()
  return yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('GraphQL Yoga submitIntake', () => {
  it('submits intake successfully and returns ranked matches', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })

    expect(response.status).toBe(200)
    const json = (await response.json()) as {
      data?: { submitIntake?: { matches: unknown[] } }
      errors?: unknown
    }

    expect(json.errors).toBeUndefined()
    expect(json.data?.submitIntake?.matches).toBeDefined()
    expect(json.data!.submitIntake!.matches.length).toBeGreaterThan(0)

    const scores = (
      json.data!.submitIntake!.matches as Array<{ score: number }>
    ).map((match) => match.score)
    const sorted = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sorted)
  })

  it('excludes inactive professionals from results', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })
    const json = (await response.json()) as {
      data: {
        submitIntake: {
          matches: Array<{ professional: { id: string } }>
        }
      }
    }

    const ids = json.data.submitIntake.matches.map(
      (match) => match.professional.id,
    )
    expect(ids).not.toContain('pro-inactive-demo')
  })

  it('returns deterministic output and a stable intake id', async () => {
    const first = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })
    const second = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })

    const firstJson = await first.json()
    const secondJson = await second.json()
    expect(firstJson).toEqual(secondJson)

    const expectedId = `intake-demo-${stableHash(JSON.stringify(validInput))}`
    expect(firstJson.data.submitIntake.intake.id).toBe(expectedId)
    expect(firstJson.data.submitIntake.intake.consentedAt).toBe(
      DEMO_CONSENTED_AT,
    )
  })

  it('rejects an invalid modality with a safe GraphQL error', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: {
        input: { ...validInput, modality: 'telepathy' },
      },
    })
    const json = (await response.json()) as {
      data: unknown
      errors: Array<{ message: string; extensions?: { exception?: unknown } }>
    }

    expect(json.data).toBeNull()
    expect(json.errors).toHaveLength(1)
    expect(json.errors[0]?.message).toBe('Invalid SubmitIntakeInput')
    expect(JSON.stringify(json.errors)).not.toMatch(/Zod|stack|telepathy/i)
  })

  it('rejects an invalid price with a safe GraphQL error', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: {
        input: { ...validInput, maxSessionPrice: 5000 },
      },
    })
    const json = (await response.json()) as {
      errors: Array<{ message: string }>
    }

    expect(json.errors[0]?.message).toBe('Invalid SubmitIntakeInput')
  })

  it('rejects an invalid support topic with a safe GraphQL error', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: {
        input: { ...validInput, supportTopic: 'diagnosis' },
      },
    })
    const json = (await response.json()) as {
      errors: Array<{ message: string }>
    }

    expect(json.errors[0]?.message).toBe('Invalid SubmitIntakeInput')
  })

  it('rejects missing consent with a safe GraphQL error', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: {
        input: { ...validInput, consent: false },
      },
    })
    const json = (await response.json()) as {
      errors: Array<{ message: string }>
    }

    expect(json.errors[0]?.message).toBe('Invalid SubmitIntakeInput')
  })

  it('returns a GraphQL error response shape without leaking internals', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: {
        input: { ...validInput, preferredPeriods: [] },
      },
    })
    const json = (await response.json()) as {
      data: null
      errors: Array<{ message: string; extensions?: Record<string, unknown> }>
    }

    expect(response.status).toBe(200)
    expect(json.data).toBeNull()
    expect(json.errors[0]).toMatchObject({
      message: 'Invalid SubmitIntakeInput',
    })
    expect(json.errors[0]?.extensions?.code).toBe('BAD_USER_INPUT')
  })
})

describe('Yoga ↔ frontend contract integration', () => {
  it('produces a response accepted by the frontend Zod schema and mapper', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })
    const json = (await response.json()) as { data: unknown; errors?: unknown }

    expect(json.errors).toBeUndefined()

    const validated = submitIntakeResponseSchema.safeParse(json.data)
    expect(validated.success).toBe(true)
    if (!validated.success) {
      return
    }

    const mapped = mapSubmitIntakeResponse(validated.data)
    expect(mapped.intakeId).toMatch(/^intake-demo-/)
    expect(mapped.intake.modality).toBe('online')
    expect(mapped.matches.length).toBeGreaterThan(0)
    expect(mapped.matches[0]?.professional.displayName).toBeTruthy()
    expect(mapped.consentedAt).toBe(DEMO_CONSENTED_AT)
  })

  it('keeps the frontend SubmitIntake operation compatible with the server schema', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validInput },
    })
    const json = (await response.json()) as { errors?: unknown }

    expect(json.errors).toBeUndefined()
    expect(SUBMIT_INTAKE_MUTATION).toContain('mutation SubmitIntake')
    expect(SUBMIT_INTAKE_MUTATION).toContain('maxSessionPrice')
    expect(SUBMIT_INTAKE_MUTATION).toContain('supportTopics')
    expect(SUBMIT_INTAKE_MUTATION).toContain('points')
  })
})
