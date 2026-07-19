import { z } from 'zod'
import type { IntakeFormValues } from '../domain/intake'

export const modalitySchema = z.enum(['online', 'in-person', 'no-preference'], {
  error: 'validation.modalityRequired',
})

export const preferredPeriodSchema = z.enum([
  'morning',
  'afternoon',
  'evening',
])

export const reasonSchema = z.enum(
  [
    'stress-and-life-balance',
    'relationships',
    'mood-and-emotions',
    'work-or-school',
    'other',
  ],
  { error: 'validation.reasonRequired' },
)

export const genderPreferenceSchema = z.enum([
  'no-preference',
  'woman',
  'man',
  'non-binary',
])

const maxSessionPriceSchema = z
  .union([z.string(), z.number()])
  .transform((value, ctx) => {
    if (value === '' || (typeof value === 'number' && Number.isNaN(value))) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.maxPriceRequired',
      })
      return z.NEVER
    }

    const amount = typeof value === 'number' ? value : Number(value)

    if (!Number.isFinite(amount)) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.maxPriceInvalid',
      })
      return z.NEVER
    }

    if (amount <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.maxPricePositive',
      })
      return z.NEVER
    }

    if (amount > 2000) {
      ctx.addIssue({
        code: 'custom',
        message: 'validation.maxPriceMax',
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
  reason: z.union([z.literal(''), reasonSchema]).refine(
    (value): value is z.infer<typeof reasonSchema> => value !== '',
    { message: 'validation.reasonRequired' },
  ),
  description: z
    .string()
    .trim()
    .min(20, 'validation.descriptionMin')
    .max(2000, 'validation.descriptionMax'),
  genderPreference: genderPreferenceSchema,
})

export const reviewStepSchema = z.object({
  consent: z.literal(true, {
    error: 'validation.consentRequired',
  }),
})

export const intakeFormSchema = preferencesStepSchema
  .extend(supportNeedsStepSchema.shape)
  .extend(reviewStepSchema.shape)

/** Validated intake payload after Zod parsing. */
export type IntakeFormParsed = z.infer<typeof intakeFormSchema>

export const intakeFormDefaultValues: IntakeFormValues = {
  modality: 'no-preference',
  preferredPeriods: [],
  maxSessionPrice: '',
  reason: '',
  description: '',
  genderPreference: 'no-preference',
  consent: false,
}

/** Fields validated when leaving each step (0-based). */
export const stepFieldNames = [
  ['modality', 'preferredPeriods', 'maxSessionPrice'],
  ['reason', 'description', 'genderPreference'],
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
] as const satisfies ReadonlyArray<
  NonNullable<IntakeFormValues['preferredPeriods'][number]>
>

export const reasonOptions = [
  'stress-and-life-balance',
  'relationships',
  'mood-and-emotions',
  'work-or-school',
  'other',
] as const satisfies ReadonlyArray<Exclude<IntakeFormValues['reason'], ''>>

export const genderPreferenceOptions = [
  'no-preference',
  'woman',
  'man',
  'non-binary',
] as const satisfies ReadonlyArray<IntakeFormValues['genderPreference']>

export const modalityLabelKeys: Record<
  IntakeFormValues['modality'],
  string
> = {
  online: 'modality.online',
  'in-person': 'modality.inPerson',
  'no-preference': 'modality.noPreference',
}

export const periodLabelKeys: Record<
  NonNullable<IntakeFormValues['preferredPeriods'][number]>,
  string
> = {
  morning: 'period.morning',
  afternoon: 'period.afternoon',
  evening: 'period.evening',
}

export const reasonLabelKeys: Record<
  Exclude<IntakeFormValues['reason'], ''>,
  string
> = {
  'stress-and-life-balance': 'reason.stressAndLifeBalance',
  relationships: 'reason.relationships',
  'mood-and-emotions': 'reason.moodAndEmotions',
  'work-or-school': 'reason.workOrSchool',
  other: 'reason.other',
}

export const genderPreferenceLabelKeys: Record<
  IntakeFormValues['genderPreference'],
  string
> = {
  'no-preference': 'gender.noPreference',
  woman: 'gender.woman',
  man: 'gender.man',
  'non-binary': 'gender.nonBinary',
}

export function translateIntakeMessage(
  t: (key: string) => string,
  message: string | undefined,
): string {
  if (!message) {
    return ''
  }

  return message.startsWith('validation.') ? t(message) : message
}
