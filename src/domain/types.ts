export type IntakeStatus = 'draft' | 'submitted' | 'in_review' | 'matched'

/** Client-provided + AI-extracted fields treated as untrusted / editable later. */
export type IntakeDraft = {
  id: string
  status: IntakeStatus
  contactName: string
  contactEmail: string
  preferredModalities: string[]
  preferredLanguages: string[]
  goalsSummary: string
  extractedNotes: string | null
}

export type MatchSuggestion = {
  professionalId: string
  score: number
  rationale: string
}

export type ReferralDecision = 'pending' | 'approved' | 'overridden'

export type Referral = {
  id: string
  intakeId: string
  suggestions: MatchSuggestion[]
  selectedProfessionalId: string | null
  decision: ReferralDecision
  coordinatorNote: string | null
}
