import { HttpResponse, delay, http } from 'msw'
import { professionalFixtures } from '../../domain/professionals/professionalFixtures'
import {
  genderPreferenceSchema,
  modalitySchema,
  preferredLanguageSchema,
  preferredPeriodSchema,
  supportTopicSchema,
} from '../../features/intake/schemas/intakeSchema'
import type { IntakeSubmissionPayload } from '../../features/intake/types/intake'
import { matchProfessionals } from '../../features/matching/domain/matchProfessionals'
import { scoreBandFor } from '../../features/matching/domain/matchingTypes'
import {
  MSW_SCENARIO_HEADER,
  isMswScenario,
  type MswScenario,
} from '../scenarios'
import { stableHash } from '../stableHash'
import { z } from 'zod'

const submitIntakeInputSchema = z.object({
  modality: modalitySchema,
  preferredPeriods: z.array(preferredPeriodSchema).min(1),
  maxSessionPrice: z.number().positive(),
  supportTopic: supportTopicSchema,
  description: z.string().nullable(),
  genderPreference: genderPreferenceSchema,
  preferredLanguage: preferredLanguageSchema,
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

function buildSuccessPayload(intake: IntakeSubmissionPayload) {
  const matches = matchProfessionals(intake, professionalFixtures)
  const id = `intake-demo-${stableHash(JSON.stringify(intake))}`

  return {
    submitIntake: {
      intake: {
        id,
        modality: intake.modality,
        preferredPeriods: intake.preferredPeriods,
        maxSessionPrice: intake.maxSessionPrice,
        supportTopic: intake.supportTopic,
        description: intake.description,
        genderPreference: intake.genderPreference,
        preferredLanguage: intake.preferredLanguage,
        consentedAt: '2026-01-15T12:00:00.000Z',
      },
      matches: matches.map((result) => ({
        score: result.score,
        quality: scoreBandFor(result.score),
        matchedCriteria: result.matchedCriteria,
        unmatchedCriteria: result.unmatchedCriteria,
        professional: {
          id: result.professional.id,
          displayName: result.professional.displayName,
          modalities: result.professional.modalities,
          availablePeriods: result.professional.availablePeriods,
          sessionPrice: result.professional.sessionPrice,
          languages: result.professional.languages,
          supportTopics: result.professional.supportTopics,
          gender: result.professional.gender,
        },
      })),
    },
  }
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

  return HttpResponse.json({
    data: buildSuccessPayload(parsedInput.data),
  })
})
