import { z } from 'zod'
import type { IntakeSubmissionPayload } from '../../intake/types/intake'
import type { MatchResult } from '../domain/matchingTypes'
import {
  genderPreferenceSchema,
  modalitySchema,
  preferredLanguageSchema,
  preferredPeriodSchema,
  supportTopicSchema,
} from '../../intake/schemas/intakeSchema'
import {
  matchCriterionTransportSchema,
  professionalTransportSchema,
} from '../../../graphql/schemas/submitIntakeResponseSchema'

const intakeSubmissionPayloadSchema = z.object({
  modality: modalitySchema,
  preferredPeriods: z.array(preferredPeriodSchema).min(1),
  maxSessionPrice: z.number().positive(),
  supportTopic: supportTopicSchema,
  description: z.string().nullable(),
  genderPreference: genderPreferenceSchema,
  preferredLanguage: preferredLanguageSchema,
  consent: z.literal(true),
})

const matchResultSchema = z.object({
  score: z.number().int().nonnegative(),
  matchedCriteria: z.array(matchCriterionTransportSchema),
  unmatchedCriteria: z.array(matchCriterionTransportSchema),
  professional: professionalTransportSchema.extend({
    active: z.boolean().optional(),
  }),
})

export type MatchesLocationState = {
  intake: IntakeSubmissionPayload
  intakeId?: string
  matches: MatchResult[]
}

export function parseMatchesLocationState(
  state: unknown,
): MatchesLocationState | null {
  if (typeof state !== 'object' || state === null) {
    return null
  }

  const record = state as Record<string, unknown>
  const intakeParsed = intakeSubmissionPayloadSchema.safeParse(record.intake)
  const matchesParsed = z.array(matchResultSchema).safeParse(record.matches)

  if (!intakeParsed.success || !matchesParsed.success) {
    return null
  }

  const matches: MatchResult[] = matchesParsed.data.map((result) => ({
    score: result.score,
    matchedCriteria: result.matchedCriteria,
    unmatchedCriteria: result.unmatchedCriteria,
    professional: {
      id: result.professional.id,
      displayName: result.professional.displayName,
      modalities: [...result.professional.modalities],
      availablePeriods: [...result.professional.availablePeriods],
      sessionPrice: result.professional.sessionPrice,
      languages: [...result.professional.languages],
      supportTopics: [...result.professional.supportTopics],
      gender: result.professional.gender,
      active: result.professional.active ?? true,
    },
  }))

  return {
    intake: intakeParsed.data,
    intakeId: typeof record.intakeId === 'string' ? record.intakeId : undefined,
    matches,
  }
}
