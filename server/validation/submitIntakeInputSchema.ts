import { z } from 'zod'

/**
 * Server-side Zod validation for SubmitIntakeInput.
 * GraphQL ensures shape/types; this enforces domain constraints and consent.
 */
export const submitIntakeInputSchema = z.object({
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

export type SubmitIntakeInput = z.infer<typeof submitIntakeInputSchema>
