import type { Professional } from '../../../domain/professionals/professional'

export type MatchCriterionId =
  | 'modality'
  | 'period'
  | 'price'
  | 'language'
  | 'topic'
  | 'gender'

export type MatchCriterionValue =
  | string
  | number
  | boolean
  | null
  | readonly string[]

export type MatchCriterion = {
  id: MatchCriterionId
  /** Points awarded for this criterion (0 when unmatched). */
  points: number
  matched: boolean
  intakeValue: MatchCriterionValue
  professionalValue: MatchCriterionValue
}

export type MatchResult = {
  professional: Professional
  score: number
  matchedCriteria: MatchCriterion[]
  unmatchedCriteria: MatchCriterion[]
}

/** Points for each criterion. Gender is an optional bonus (base max 100). */
export const MATCH_POINTS = {
  modality: 30,
  period: 20,
  price: 20,
  language: 15,
  topic: 15,
  genderBonus: 5,
} as const

/**
 * UI score bands (administrative labels only — not clinical certainty).
 * Strong ≥ 80, possible ≥ 50, limited < 50.
 */
export type MatchScoreBand = 'strong' | 'possible' | 'limited'

export function scoreBandFor(score: number): MatchScoreBand {
  if (score >= 80) {
    return 'strong'
  }
  if (score >= 50) {
    return 'possible'
  }
  return 'limited'
}
