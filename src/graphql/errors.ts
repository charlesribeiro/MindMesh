export type SubmitIntakeApiErrorKind =
  | 'network'
  | 'graphql'
  | 'invalid_response'
  | 'unexpected'

export class SubmitIntakeApiError extends Error {
  readonly kind: SubmitIntakeApiErrorKind

  constructor(
    kind: SubmitIntakeApiErrorKind,
    message: string,
    causeDetail?: unknown,
  ) {
    super(message, causeDetail === undefined ? undefined : { cause: causeDetail })
    this.name = 'SubmitIntakeApiError'
    this.kind = kind
  }
}

export function logSubmitIntakeTechnicalError(
  error: SubmitIntakeApiError,
): void {
  if (!import.meta.env.DEV) {
    return
  }

  console.error('[submitIntake]', error.kind, error.message, error.cause)
}

/** Maps API error kinds to intake i18n keys (no technical jargon in UI). */
export function submitIntakeErrorI18nKey(
  kind: SubmitIntakeApiErrorKind,
): `error.${string}` {
  switch (kind) {
    case 'network':
      return 'error.network'
    case 'graphql':
      return 'error.server'
    case 'invalid_response':
      return 'error.invalidResponse'
    case 'unexpected':
      return 'error.unexpected'
  }
}
