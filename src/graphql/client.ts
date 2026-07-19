import { GraphQLClient } from 'graphql-request'
import { SubmitIntakeApiError } from './errors'
import {
  MSW_SCENARIO_HEADER,
  readDevMswScenario,
  type MswScenario,
} from '../mocks/scenarios'

/** Finite client-side timeout for GraphQL requests (retryable as network). */
export const GRAPHQL_REQUEST_TIMEOUT_MS = 15_000

/** Absolute URL so graphql-request works in browser and Node/jsdom tests. */
export function resolveGraphQLEndpoint(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/graphql`
  }

  return 'http://localhost/graphql'
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
