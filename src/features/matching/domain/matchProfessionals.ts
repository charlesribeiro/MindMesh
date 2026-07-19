import type { Professional } from '../../../domain/professionals/professional'
import type { IntakeSubmissionPayload } from '../../intake/types/intake'
import {
  MATCH_POINTS,
  type MatchCriterion,
  type MatchResult,
} from './matchingTypes'

function scoreModality(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion {
  const intakeValue = intake.modality
  const professionalValue = [...professional.modalities]

  if (intake.modality === 'no-preference') {
    return {
      id: 'modality',
      points: MATCH_POINTS.modality,
      matched: true,
      intakeValue,
      professionalValue,
    }
  }

  const matched = professional.modalities.includes(intake.modality)
  return {
    id: 'modality',
    points: matched ? MATCH_POINTS.modality : 0,
    matched,
    intakeValue,
    professionalValue,
  }
}

function scorePeriod(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion {
  const preferred = intake.preferredPeriods
  const available = professional.availablePeriods
  const overlapCount = preferred.filter((period) =>
    available.includes(period),
  ).length
  const denominator = preferred.length
  const points =
    denominator === 0
      ? 0
      : Math.floor((overlapCount * MATCH_POINTS.period) / denominator)

  return {
    id: 'period',
    points,
    matched: points > 0,
    intakeValue: [...preferred],
    professionalValue: [...available],
  }
}

function scorePrice(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion {
  const max = Math.trunc(intake.maxSessionPrice)
  const price = Math.trunc(professional.sessionPrice)
  const matched = price <= max

  return {
    id: 'price',
    points: matched ? MATCH_POINTS.price : 0,
    matched,
    intakeValue: max,
    professionalValue: price,
  }
}

function scoreLanguage(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion {
  const intakeValue = intake.preferredLanguage
  const professionalValue = [...professional.languages]

  if (intake.preferredLanguage === 'no-preference') {
    return {
      id: 'language',
      points: MATCH_POINTS.language,
      matched: true,
      intakeValue,
      professionalValue,
    }
  }

  const matched = professional.languages.includes(intake.preferredLanguage)
  return {
    id: 'language',
    points: matched ? MATCH_POINTS.language : 0,
    matched,
    intakeValue,
    professionalValue,
  }
}

function scoreTopic(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion {
  const matched = professional.supportTopics.includes(intake.supportTopic)
  return {
    id: 'topic',
    points: matched ? MATCH_POINTS.topic : 0,
    matched,
    intakeValue: intake.supportTopic,
    professionalValue: [...professional.supportTopics],
  }
}

function scoreGender(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchCriterion | null {
  if (intake.genderPreference === 'no-preference') {
    return null
  }

  const matched = professional.gender === intake.genderPreference
  return {
    id: 'gender',
    points: matched ? MATCH_POINTS.genderBonus : 0,
    matched,
    intakeValue: intake.genderPreference,
    professionalValue: professional.gender,
  }
}

function evaluateProfessional(
  intake: IntakeSubmissionPayload,
  professional: Professional,
): MatchResult {
  const criteria: MatchCriterion[] = [
    scoreModality(intake, professional),
    scorePeriod(intake, professional),
    scorePrice(intake, professional),
    scoreLanguage(intake, professional),
    scoreTopic(intake, professional),
  ]

  const genderCriterion = scoreGender(intake, professional)
  if (genderCriterion) {
    criteria.push(genderCriterion)
  }

  const matchedCriteria = criteria.filter((c) => c.matched)
  const unmatchedCriteria = criteria.filter((c) => !c.matched)
  const score = criteria.reduce((sum, c) => sum + c.points, 0)

  return {
    professional,
    score,
    matchedCriteria,
    unmatchedCriteria,
  }
}

function compareResults(a: MatchResult, b: MatchResult): number {
  if (b.score !== a.score) {
    return b.score - a.score
  }
  if (a.professional.sessionPrice !== b.professional.sessionPrice) {
    return a.professional.sessionPrice - b.professional.sessionPrice
  }
  if (a.professional.id < b.professional.id) {
    return -1
  }
  if (a.professional.id > b.professional.id) {
    return 1
  }
  return 0
}

/**
 * Deterministic administrative matching.
 *
 * Scoring (base max 100; gender bonus may yield up to 105):
 * - modality: 30 (full when intake is no-preference)
 * - preferred-period overlap: up to 20, proportional
 * - price within budget: 20 (integer compare; above budget → 0)
 * - preferred language: 15 (full when intake is no-preference)
 * - support topic: 15
 * - gender preference: +5 bonus only when explicitly selected
 *
 * Inactive professionals are excluded. Input arrays are not mutated.
 * Ties: higher score, then lower session price, then stable professional id.
 *
 * Results are administrative suggestions for human review — not clinical
 * recommendations or diagnoses.
 */
export function matchProfessionals(
  intake: IntakeSubmissionPayload,
  professionals: readonly Professional[],
): MatchResult[] {
  const results: MatchResult[] = []

  for (const professional of professionals) {
    if (!professional.active) {
      continue
    }
    results.push(evaluateProfessional(intake, professional))
  }

  return results.sort(compareResults)
}
