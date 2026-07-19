import { z } from 'zod'
import {
  genderPreferenceSchema,
  modalitySchema,
  preferredLanguageSchema,
  preferredPeriodSchema,
  supportTopicSchema,
} from '../../features/intake/schemas/intakeSchema'

const matchCriterionIdSchema = z.enum([
  'modality',
  'period',
  'price',
  'language',
  'topic',
  'gender',
])

const matchCriterionValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
])

export const matchCriterionTransportSchema = z.object({
  id: matchCriterionIdSchema,
  points: z.number().int().nonnegative(),
  matched: z.boolean(),
  intakeValue: matchCriterionValueSchema,
  professionalValue: matchCriterionValueSchema,
})

export const professionalTransportSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  modalities: z.array(z.enum(['online', 'in-person'])).min(1),
  availablePeriods: z.array(preferredPeriodSchema),
  sessionPrice: z.number().int().positive(),
  languages: z.array(z.enum(['en', 'pt-BR', 'es'])).min(1),
  supportTopics: z.array(supportTopicSchema).min(1),
  gender: z.enum(['female', 'male', 'non-binary', 'not-specified']),
})

export const matchResultTransportSchema = z.object({
  score: z.number().int().nonnegative(),
  quality: z.enum(['strong', 'possible', 'limited']),
  matchedCriteria: z.array(matchCriterionTransportSchema),
  unmatchedCriteria: z.array(matchCriterionTransportSchema),
  professional: professionalTransportSchema,
})

export const submittedIntakeTransportSchema = z.object({
  id: z.string().min(1),
  modality: modalitySchema,
  preferredPeriods: z.array(preferredPeriodSchema).min(1),
  maxSessionPrice: z.number().positive(),
  supportTopic: supportTopicSchema,
  description: z.string().nullable(),
  genderPreference: genderPreferenceSchema,
  preferredLanguage: preferredLanguageSchema,
  consentedAt: z.string().min(1),
})

export const submitIntakePayloadSchema = z.object({
  intake: submittedIntakeTransportSchema,
  matches: z.array(matchResultTransportSchema),
})

export const submitIntakeResponseSchema = z.object({
  submitIntake: submitIntakePayloadSchema,
})

export type SubmitIntakeResponseTransport = z.infer<
  typeof submitIntakeResponseSchema
>
export type MatchResultTransport = z.infer<typeof matchResultTransportSchema>
export type SubmittedIntakeTransport = z.infer<
  typeof submittedIntakeTransportSchema
>
