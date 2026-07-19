/** MSW scenario header for development and tests. */
export const MSW_SCENARIO_HEADER = 'x-mindmesh-msw-scenario'

export type MswScenario =
  | 'success'
  | 'network'
  | 'graphql'
  | 'malformed'
  | 'delay'

export const MSW_SCENARIOS: readonly MswScenario[] = [
  'success',
  'network',
  'graphql',
  'malformed',
  'delay',
] as const

export function isMswScenario(value: string): value is MswScenario {
  return (MSW_SCENARIOS as readonly string[]).includes(value)
}

/**
 * Dev-only: read `?mswScenario=` from the current URL.
 * Returns undefined in production builds.
 */
export function readDevMswScenario(): MswScenario | undefined {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return undefined
  }

  const value = new URLSearchParams(window.location.search).get('mswScenario')
  if (!value || !isMswScenario(value)) {
    return undefined
  }

  return value
}
