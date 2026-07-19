import { HttpResponse, delay, http } from 'msw'
import { buildSubmitIntakeResult } from '../../domain/intake/buildSubmitIntakeResult'
import type { IntakeSubmissionPayload } from '../../features/intake/types/intake'
import {
  MSW_SCENARIO_HEADER,
  isMswScenario,
  type MswScenario,
} from '../scenarios'
import { z } from 'zod'

const submitIntakeInputSchema = z.object({
  modality: z.enum(['online', 'in-person', 'no-preference']),
  preferredPeriods: z.array(z.enum(['morning', 'afternoon', 'evening'])).min(1),
  maxSessionPrice: z.number().positive().max(2000),
  supportTopic: z.enum([
    'anxiety',
    'relationships',
    'work',
    'grief',
    'self-knowledge',
    'other',
  ]),
  description: z.string().nullable(),
  genderPreference: z.enum(['female', 'male', 'non-binary', 'no-preference']),
  preferredLanguage: z.enum(['en', 'pt-BR', 'es', 'no-preference']),
  consent: z.literal(true),
})

type GraphQLBody = {
  query?: string
  variables?: {
    input?: unknown
  }
}

function resolveScenario(request: Request): MswScenario {
  const header = request.headers.get(MSW_SCENARIO_HEADER)
  if (header && isMswScenario(header)) {
    return header
  }
  return 'success'
}

function wait(ms: number): Promise<void> {
  return delay(ms)
}

export const submitIntakeHandler = http.post('*/graphql', async ({ request }) => {
  const scenario = resolveScenario(request)

  if (scenario === 'network') {
    return HttpResponse.error()
  }

  let body: GraphQLBody
  try {
    body = (await request.json()) as GraphQLBody
  } catch {
    return HttpResponse.json(
      { errors: [{ message: 'Invalid JSON body' }] },
      { status: 400 },
    )
  }

  if (scenario === 'graphql') {
    await wait(50)
    return HttpResponse.json({
      errors: [{ message: 'Simulated submitIntake failure' }],
    })
  }

  const parsedInput = submitIntakeInputSchema.safeParse(body.variables?.input)
  if (!parsedInput.success) {
    return HttpResponse.json({
      errors: [{ message: 'Invalid SubmitIntakeInput' }],
    })
  }

  const delayMs = scenario === 'delay' ? 800 : 300
  await wait(delayMs)

  if (scenario === 'malformed') {
    return HttpResponse.json({
      data: {
        submitIntake: {
          intake: {
            id: 'broken',
            modality: 'online',
          },
          matches: 'not-an-array',
        },
      },
    })
  }

  const intake: IntakeSubmissionPayload = {
    ...parsedInput.data,
    preferredPeriods: [...parsedInput.data.preferredPeriods],
    consent: true,
  }

  return HttpResponse.json({
    data: {
      submitIntake: buildSubmitIntakeResult(intake),
    },
  })
})
