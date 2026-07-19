/** Session modality preference for administrative matching — not clinical. */
export type SessionModalityPreference = 'online' | 'in-person' | 'no-preference'

export type PreferredPeriod = 'morning' | 'afternoon' | 'evening'

export type SupportReason =
  | 'stress-and-life-balance'
  | 'relationships'
  | 'mood-and-emotions'
  | 'work-or-school'
  | 'other'

export type GenderPreference =
  | 'no-preference'
  | 'woman'
  | 'man'
  | 'non-binary'

export type IntakeSubmissionStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error'

export type IntakeFormValues = {
  modality: SessionModalityPreference
  preferredPeriods: PreferredPeriod[]
  /** Empty until the user enters a value; coerced to number on validate. */
  maxSessionPrice: number | ''
  reason: SupportReason | ''
  description: string
  genderPreference: GenderPreference
  consent: boolean
}

export type IntakeSubmissionResult = {
  id: string
}
