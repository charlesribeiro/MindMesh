import { GraphQLClient } from 'graphql-request'
import {
  MSW_SCENARIO_HEADER,
  readDevMswScenario,
  type MswScenario,
} from '../mocks/scenarios'

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

export async function requestGraphQL<TResult, TVariables extends object>(
  document: string,
  variables: TVariables,
  scenario?: MswScenario,
): Promise<TResult> {
  const client = createGraphQLClient(scenario)
  return client.request<TResult>(document, variables)
}
