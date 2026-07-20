import { GraphQLClient } from 'graphql-request'
import { SubmitIntakeApiError } from './errors'
import {
  MSW_SCENARIO_HEADER,
  readDevMswScenario,
  type MswScenario,
} from '../mocks/scenarios'

/** Finite client-side timeout for GraphQL requests (retryable as network). */
export const GRAPHQL_REQUEST_TIMEOUT_MS = 15_000

/** Default local Yoga endpoint when VITE_GRAPHQL_ENDPOINT is unset. */
export const DEFAULT_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'

/**
 * Absolute GraphQL URL for browser and Node/jsdom tests.
 * Prefers VITE_GRAPHQL_ENDPOINT; falls back to the local Yoga default.
 */
export function resolveGraphQLEndpoint(): string {
  const configured = import.meta.env.VITE_GRAPHQL_ENDPOINT
  if (typeof configured === 'string' && configured.trim().length > 0) {
    return configured.trim()
  }

  return DEFAULT_GRAPHQL_ENDPOINT
}

export const GRAPHQL_ENDPOINT = resolveGraphQLEndpoint()

function buildHeaders(scenario?: MswScenario): HeadersInit | undefined {
  const resolved = scenario ?? readDevMswScenario()
  if (!resolved || resolved === 'success') {
    return undefined
  }

  return {
    [MSW_SCENARIO_HEADER]: resolved,
  }
}

export function createGraphQLClient(scenario?: MswScenario): GraphQLClient {
  return new GraphQLClient(resolveGraphQLEndpoint(), {
    credentials: 'include',
    headers: buildHeaders(scenario),
  })
}

function isTimeoutOrAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /timed?\s*out|aborted/i.test(error.message)
  )
}

export async function requestGraphQL<TResult, TVariables extends object>(
  document: string,
  variables: TVariables,
  scenario?: MswScenario,
): Promise<TResult> {
  const client = createGraphQLClient(scenario)

  try {
    return await client.request<TResult>({
      document,
      variables,
      signal: AbortSignal.timeout(GRAPHQL_REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    if (isTimeoutOrAbortError(error)) {
      throw new SubmitIntakeApiError(
        'network',
        'Request timed out',
        error,
      )
    }

    throw error
  }
}
