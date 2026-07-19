/** Shared administrative period preference — not clinical. */
export type PreferredPeriod = 'morning' | 'afternoon' | 'evening'

/** Administrative support topic tags — not diagnoses. */
export type SupportTopic =
  | 'anxiety'
  | 'relationships'
  | 'work'
  | 'grief'
  | 'self-knowledge'
  | 'other'

/** Modalities a professional can offer (no intake “no-preference”). */
export type ServiceModality = 'online' | 'in-person'

/** Languages a professional can speak (stable IDs). */
export type SpokenLanguage = 'en' | 'pt-BR' | 'es'

export type ProfessionalGender =
  | 'female'
  | 'male'
  | 'non-binary'
  | 'not-specified'

/**
 * Fictional professional directory entry for administrative matching.
 * Matching results are suggestions for coordinator review — not clinical advice.
 */
export type Professional = {
  id: string
  displayName: string
  modalities: ServiceModality[]
  availablePeriods: PreferredPeriod[]
  /** Whole USD dollars per session (integer). */
  sessionPrice: number
  languages: SpokenLanguage[]
  supportTopics: SupportTopic[]
  gender: ProfessionalGender
  active: boolean
}
