import { buildSubmitIntakeResult } from '../../src/domain/intake/buildSubmitIntakeResult'
import type { IntakeSubmissionPayload } from '../../src/features/intake/types/intake'
import type { SubmitIntakeInput } from '../validation/submitIntakeInputSchema'

export function mapInputToDomainIntake(
  input: SubmitIntakeInput,
): IntakeSubmissionPayload {
  return {
    modality: input.modality,
    preferredPeriods: [...input.preferredPeriods],
    maxSessionPrice: input.maxSessionPrice,
    supportTopic: input.supportTopic,
    description: input.description,
    genderPreference: input.genderPreference,
    preferredLanguage: input.preferredLanguage,
    consent: true,
  }
}

export function submitIntakeService(input: SubmitIntakeInput) {
  return buildSubmitIntakeResult(mapInputToDomainIntake(input))
}
