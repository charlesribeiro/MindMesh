import type {
  PreferredPeriod,
  SupportTopic,
} from '../../../domain/professionals/professional'

export type { PreferredPeriod, SupportTopic }

/** Intake modality preference, including no preference. */
export type ServiceModality = 'online' | 'in-person' | 'no-preference'

export type GenderPreference =
  | 'female'
  | 'male'
  | 'non-binary'
  | 'no-preference'

/** Administrative language preference for matching — not clinical. */
export type PreferredLanguage = 'en' | 'pt-BR' | 'es' | 'no-preference'

export type IntakeFormValues = {
  modality: ServiceModality
  preferredPeriods: PreferredPeriod[]
  maxSessionPrice: number | ''
  supportTopic: SupportTopic | ''
  description: string
  genderPreference: GenderPreference
  preferredLanguage: PreferredLanguage
  consent: boolean
}

/** Validated payload ready for submission (UI-independent). */
export type IntakeSubmissionPayload = {
  modality: ServiceModality
  preferredPeriods: PreferredPeriod[]
  maxSessionPrice: number
  supportTopic: SupportTopic
  description: string | null
  genderPreference: GenderPreference
  preferredLanguage: PreferredLanguage
  consent: true
}

export type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; intakeId: string; intake: IntakeSubmissionPayload }
  | { status: 'error'; message: string }

export type IntakeSubmissionResult = {
  id: string
}
