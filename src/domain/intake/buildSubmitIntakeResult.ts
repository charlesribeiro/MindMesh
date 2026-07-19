import type { IntakeSubmissionPayload } from '../../features/intake/types/intake'
import { matchProfessionals } from '../../features/matching/domain/matchProfessionals'
import { scoreBandFor } from '../../features/matching/domain/matchingTypes'
import { professionalFixtures } from '../professionals/professionalFixtures'
import { stableHash } from '../stableHash'

/** Fixed fictional consent timestamp for deterministic demo payloads. */
export const DEMO_CONSENTED_AT = '2026-01-15T12:00:00.000Z'

export type SubmitIntakeResultPayload = {
  intake: {
    id: string
    modality: IntakeSubmissionPayload['modality']
    preferredPeriods: IntakeSubmissionPayload['preferredPeriods']
    maxSessionPrice: number
    supportTopic: IntakeSubmissionPayload['supportTopic']
    description: string | null
    genderPreference: IntakeSubmissionPayload['genderPreference']
    preferredLanguage: IntakeSubmissionPayload['preferredLanguage']
    consentedAt: string
  }
  matches: Array<{
    score: number
    quality: ReturnType<typeof scoreBandFor>
    matchedCriteria: ReturnType<typeof matchProfessionals>[number]['matchedCriteria']
    unmatchedCriteria: ReturnType<
      typeof matchProfessionals
    >[number]['unmatchedCriteria']
    professional: {
      id: string
      displayName: string
      modalities: ReturnType<
        typeof matchProfessionals
      >[number]['professional']['modalities']
      availablePeriods: ReturnType<
        typeof matchProfessionals
      >[number]['professional']['availablePeriods']
      sessionPrice: number
      languages: ReturnType<
        typeof matchProfessionals
      >[number]['professional']['languages']
      supportTopics: ReturnType<
        typeof matchProfessionals
      >[number]['professional']['supportTopics']
      gender: ReturnType<
        typeof matchProfessionals
      >[number]['professional']['gender']
    }
  }>
}

/**
 * Runs deterministic matching and builds the GraphQL/MSW success payload shape.
 * Pure domain helper — no React, GraphQL, browser, or i18n imports.
 */
export function buildSubmitIntakeResult(
  intake: IntakeSubmissionPayload,
): SubmitIntakeResultPayload {
  const matches = matchProfessionals(intake, professionalFixtures)
  const id = `intake-demo-${stableHash(JSON.stringify(intake))}`

  return {
    intake: {
      id,
      modality: intake.modality,
      preferredPeriods: [...intake.preferredPeriods],
      maxSessionPrice: intake.maxSessionPrice,
      supportTopic: intake.supportTopic,
      description: intake.description,
      genderPreference: intake.genderPreference,
      preferredLanguage: intake.preferredLanguage,
      consentedAt: DEMO_CONSENTED_AT,
    },
    matches: matches.map((result) => ({
      score: result.score,
      quality: scoreBandFor(result.score),
      matchedCriteria: result.matchedCriteria,
      unmatchedCriteria: result.unmatchedCriteria,
      professional: {
        id: result.professional.id,
        displayName: result.professional.displayName,
        modalities: [...result.professional.modalities],
        availablePeriods: [...result.professional.availablePeriods],
        sessionPrice: result.professional.sessionPrice,
        languages: [...result.professional.languages],
        supportTopics: [...result.professional.supportTopics],
        gender: result.professional.gender,
      },
    })),
  }
}
