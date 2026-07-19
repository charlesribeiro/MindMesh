import type { IntakeSubmissionPayload } from '../../intake/types/intake'
import {
  genderPreferenceSchema,
  modalitySchema,
  preferredLanguageSchema,
  preferredPeriodSchema,
  supportTopicSchema,
} from '../../intake/schemas/intakeSchema'
import { z } from 'zod'

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

export type MatchesLocationState = {
  intake: IntakeSubmissionPayload
  intakeId?: string
}

export function parseMatchesLocationState(
  state: unknown,
): MatchesLocationState | null {
  if (typeof state !== 'object' || state === null) {
    return null
  }

  const record = state as Record<string, unknown>
  const parsed = intakeSubmissionPayloadSchema.safeParse(record.intake)
  if (!parsed.success) {
    return null
  }

  return {
    intake: parsed.data,
    intakeId: typeof record.intakeId === 'string' ? record.intakeId : undefined,
  }
}
