import { z } from 'zod'
import type { IntakeFormValues, IntakeSubmissionPayload } from '../types/intake'

export const modalitySchema = z.enum(['online', 'in-person', 'no-preference'], {
  error: 'validation.modalityRequired',
})

export const preferredPeriodSchema = z.enum([
  'morning',
  'afternoon',
  'evening',
])

export const supportTopicSchema = z.enum(
  [
    'anxiety',
    'relationships',
    'work',
    'grief',
    'self-knowledge',
    'other',
  ],
  { error: 'validation.supportTopicRequired' },
)

export const genderPreferenceSchema = z.enum([
  'female',
  'male',
  'non-binary',
  'no-preference',
])

export const preferredLanguageSchema = z.enum([
  'en',
  'pt-BR',
  'es',
  'no-preference',
])

const maxSessionPriceSchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === '' || (typeof value === 'number' && Number.isNaN(value))) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.invalidPrice',
      })
      return z.NEVER
    }

    const amount = typeof value === 'number' ? value : Number(value)

    if (!Number.isFinite(amount)) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.invalidPrice',
      })
      return z.NEVER
    }

    if (amount <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.invalidPrice',
      })
      return z.NEVER
    }

    if (amount > 2000) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.priceTooHigh',
      })
      return z.NEVER
    }

    return amount
  })

export const preferencesStepSchema = z.object({
  modality: modalitySchema,
  preferredPeriods: z
    .array(preferredPeriodSchema)
    .min(1, 'validation.preferredPeriodsMin'),
  maxSessionPrice: maxSessionPriceSchema,
})

export const supportNeedsStepSchema = z.object({
  supportTopic: z.union([z.literal(''), supportTopicSchema]).refine(
    (value): value is z.infer<typeof supportTopicSchema> => value !== '',
    { message: 'validation.supportTopicRequired' },
  ),
  description: z
    .string()
    .trim()
    .max(2000, 'validation.descriptionMax'),
  genderPreference: genderPreferenceSchema,
  preferredLanguage: preferredLanguageSchema,
})

export const reviewStepSchema = z.object({
  consent: z.literal(true, {
    error: 'validation.consentRequired',
  }),
})

export const intakeFormSchema = preferencesStepSchema
  .extend(supportNeedsStepSchema.shape)
  .extend(reviewStepSchema.shape)

export type IntakeFormParsed = z.infer<typeof intakeFormSchema>

export const intakeFormDefaultValues: IntakeFormValues = {
  modality: 'no-preference',
  preferredPeriods: [],
  maxSessionPrice: '',
  supportTopic: '',
  description: '',
  genderPreference: 'no-preference',
  preferredLanguage: 'no-preference',
  consent: false,
}

export const stepFieldNames = [
  ['modality', 'preferredPeriods', 'maxSessionPrice'],
  ['supportTopic', 'description', 'genderPreference', 'preferredLanguage'],
  ['consent'],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof IntakeFormValues>>

export const modalityOptions = [
  'online',
  'in-person',
  'no-preference',
] as const satisfies ReadonlyArray<IntakeFormValues['modality']>

export const periodOptions = [
  'morning',
  'afternoon',
  'evening',
] as const satisfies ReadonlyArray<PreferredPeriodOption>

type PreferredPeriodOption = NonNullable<
  IntakeFormValues['preferredPeriods'][number]
>

export const supportTopicOptions = [
  'anxiety',
  'relationships',
  'work',
  'grief',
  'self-knowledge',
  'other',
] as const satisfies ReadonlyArray<Exclude<IntakeFormValues['supportTopic'], ''>>

export const genderPreferenceOptions = [
  'no-preference',
  'female',
  'male',
  'non-binary',
] as const satisfies ReadonlyArray<IntakeFormValues['genderPreference']>

export const preferredLanguageOptions = [
  'no-preference',
  'en',
  'pt-BR',
  'es',
] as const satisfies ReadonlyArray<IntakeFormValues['preferredLanguage']>

export const modalityLabelKeys = {
  online: 'options.modality.online',
  'in-person': 'options.modality.inPerson',
  'no-preference': 'options.modality.noPreference',
} as const

export const periodLabelKeys = {
  morning: 'options.period.morning',
  afternoon: 'options.period.afternoon',
  evening: 'options.period.evening',
} as const

export const supportTopicLabelKeys = {
  anxiety: 'options.supportTopic.anxiety',
  relationships: 'options.supportTopic.relationships',
  work: 'options.supportTopic.work',
  grief: 'options.supportTopic.grief',
  'self-knowledge': 'options.supportTopic.selfKnowledge',
  other: 'options.supportTopic.other',
} as const

export const genderPreferenceLabelKeys = {
  'no-preference': 'options.gender.noPreference',
  female: 'options.gender.female',
  male: 'options.gender.male',
  'non-binary': 'options.gender.nonBinary',
} as const

export const preferredLanguageLabelKeys = {
  'no-preference': 'options.language.noPreference',
  en: 'options.language.en',
  'pt-BR': 'options.language.ptBR',
  es: 'options.language.es',
} as const

export function translateIntakeMessage(
  t: (key: string) => string,
  message: string | undefined,
): string {
  if (!message) {
    return ''
  }

  return message.startsWith('validation.') ? t(message) : message
}

export function toSubmissionPayload(
  values: IntakeFormParsed,
): IntakeSubmissionPayload {
  const trimmedDescription = values.description.trim()

  return {
    modality: values.modality,
    preferredPeriods: values.preferredPeriods,
    maxSessionPrice: values.maxSessionPrice,
    supportTopic: values.supportTopic,
    description: trimmedDescription.length > 0 ? trimmedDescription : null,
    genderPreference: values.genderPreference,
    preferredLanguage: values.preferredLanguage,
    consent: true,
  }
}
