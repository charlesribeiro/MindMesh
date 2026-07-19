import { ClientError } from 'graphql-request'
import { requestGraphQL } from '../../../graphql/client'
import {
  SubmitIntakeApiError,
  logSubmitIntakeTechnicalError,
} from '../../../graphql/errors'
import { mapSubmitIntakeResponse } from '../../../graphql/mappers/mapSubmitIntakeResponse'
import {
  SUBMIT_INTAKE_MUTATION,
  type SubmitIntakeInputVariables,
} from '../../../graphql/operations/submitIntakeOperation'
import { submitIntakeResponseSchema } from '../../../graphql/schemas/submitIntakeResponseSchema'
import type { MswScenario } from '../../../mocks/scenarios'
import {
  intakeFormSchema,
  toSubmissionPayload,
} from '../schemas/intakeSchema'
import type { IntakeSubmissionPayload } from '../types/intake'
import type { SubmitIntakeDomainResult } from '../../../graphql/mappers/mapSubmitIntakeResponse'

export type { SubmitIntakeDomainResult }

function toApiError(error: unknown): SubmitIntakeApiError {
  if (error instanceof SubmitIntakeApiError) {
    return error
  }

  if (error instanceof ClientError) {
    const graphqlErrors = error.response.errors
    if (graphqlErrors && graphqlErrors.length > 0) {
      return new SubmitIntakeApiError(
        'graphql',
        'GraphQL operation returned errors',
        graphqlErrors,
      )
    }

    return new SubmitIntakeApiError(
      'network',
      'Network request failed',
      error,
    )
  }

  if (error instanceof TypeError) {
    return new SubmitIntakeApiError('network', 'Network request failed', error)
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    /Failed to fetch|NetworkError|Network request failed/i.test(
      (error as { message: string }).message,
    )
  ) {
    return new SubmitIntakeApiError('network', 'Network request failed', error)
  }

  return new SubmitIntakeApiError(
    'unexpected',
    'Unexpected submission failure',
    error,
  )
}

/**
 * Submits intake through the GraphQL boundary.
 * Responses are validated with Zod before mapping to domain types.
 */
export async function submitIntake(
  values: unknown,
  options: { scenario?: MswScenario } = {},
): Promise<SubmitIntakeDomainResult> {
  const parsed = intakeFormSchema.safeParse(values)
  if (!parsed.success) {
    const error = new SubmitIntakeApiError(
      'unexpected',
      'Client-side intake validation failed',
      parsed.error,
    )
    logSubmitIntakeTechnicalError(error)
    throw error
  }

  const payload: IntakeSubmissionPayload = toSubmissionPayload(parsed.data)
  const variables: SubmitIntakeInputVariables = {
    input: {
      modality: payload.modality,
      preferredPeriods: payload.preferredPeriods,
      maxSessionPrice: payload.maxSessionPrice,
      supportTopic: payload.supportTopic,
      description: payload.description,
      genderPreference: payload.genderPreference,
      preferredLanguage: payload.preferredLanguage,
      consent: true,
    },
  }

  try {
    const raw = await requestGraphQL<unknown, SubmitIntakeInputVariables>(
      SUBMIT_INTAKE_MUTATION,
      variables,
      options.scenario,
    )

    const validated = submitIntakeResponseSchema.safeParse(raw)
    if (!validated.success) {
      const error = new SubmitIntakeApiError(
        'invalid_response',
        'Response failed schema validation',
        validated.error,
      )
      logSubmitIntakeTechnicalError(error)
      throw error
    }

    return mapSubmitIntakeResponse(validated.data)
  } catch (error) {
    if (error instanceof SubmitIntakeApiError) {
      throw error
    }

    const apiError = toApiError(error)
    logSubmitIntakeTechnicalError(apiError)
    throw apiError
  }
}
