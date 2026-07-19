import type { Professional } from '../../domain/professionals/professional'
import type { IntakeSubmissionPayload } from '../../features/intake/types/intake'
import type {
  MatchCriterion,
  MatchResult,
  MatchScoreBand,
} from '../../features/matching/domain/matchingTypes'
import { scoreBandFor } from '../../features/matching/domain/matchingTypes'
import type {
  MatchResultTransport,
  SubmitIntakeResponseTransport,
  SubmittedIntakeTransport,
} from '../schemas/submitIntakeResponseSchema'

export type SubmitIntakeDomainResult = {
  intakeId: string
  intake: IntakeSubmissionPayload
  matches: MatchResult[]
  consentedAt: string
}

function mapCriterion(
  criterion: MatchResultTransport['matchedCriteria'][number],
): MatchCriterion {
  return {
    id: criterion.id,
    points: criterion.points,
    matched: criterion.matched,
    intakeValue: criterion.intakeValue,
    professionalValue: criterion.professionalValue,
  }
}

function mapProfessional(
  professional: MatchResultTransport['professional'],
): Professional {
  return {
    id: professional.id,
    displayName: professional.displayName,
    modalities: [...professional.modalities],
    availablePeriods: [...professional.availablePeriods],
    sessionPrice: professional.sessionPrice,
    languages: [...professional.languages],
    supportTopics: [...professional.supportTopics],
    gender: professional.gender,
    active: true,
  }
}

function mapMatch(result: MatchResultTransport): MatchResult {
  const qualityFromScore: MatchScoreBand = scoreBandFor(result.score)
  if (qualityFromScore !== result.quality && import.meta.env.DEV) {
    console.debug(
      '[mapSubmitIntakeResponse] quality mismatch; using score band',
      { score: result.score, quality: result.quality, qualityFromScore },
    )
  }

  return {
    professional: mapProfessional(result.professional),
    score: result.score,
    matchedCriteria: result.matchedCriteria.map(mapCriterion),
    unmatchedCriteria: result.unmatchedCriteria.map(mapCriterion),
  }
}

function mapIntake(
  transport: SubmittedIntakeTransport,
): IntakeSubmissionPayload {
  return {
    modality: transport.modality,
    preferredPeriods: [...transport.preferredPeriods],
    maxSessionPrice: transport.maxSessionPrice,
    supportTopic: transport.supportTopic,
    description: transport.description,
    genderPreference: transport.genderPreference,
    preferredLanguage: transport.preferredLanguage,
    consent: true,
  }
}

export function mapSubmitIntakeResponse(
  response: SubmitIntakeResponseTransport,
): SubmitIntakeDomainResult {
  const payload = response.submitIntake

  return {
    intakeId: payload.intake.id,
    intake: mapIntake(payload.intake),
    matches: payload.matches.map(mapMatch),
    consentedAt: payload.intake.consentedAt,
  }
}
