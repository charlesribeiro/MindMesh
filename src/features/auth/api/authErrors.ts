export class AuthApiError extends Error {
  readonly kind:
    | 'invalid_credentials'
    | 'unauthenticated'
    | 'forbidden'
    | 'network'
    | 'invalid_response'
    | 'unexpected'

  constructor(
    kind: AuthApiError['kind'],
    message: string,
    causeDetail?: unknown,
  ) {
    super(message, causeDetail === undefined ? undefined : { cause: causeDetail })
    this.name = 'AuthApiError'
    this.kind = kind
  }
}

export function logAuthTechnicalError(error: AuthApiError): void {
  if (!import.meta.env.DEV) {
    return
  }

  // Never log passwords, cookies, JWTs, or Authorization headers.
  console.error('[auth]', error.kind, error.message)
}

export function authErrorI18nKey(
  kind: AuthApiError['kind'],
): `error.${string}` {
  switch (kind) {
    case 'invalid_credentials':
      return 'error.invalidCredentials'
    case 'unauthenticated':
      return 'error.sessionExpired'
    case 'forbidden':
      return 'error.forbidden'
    case 'network':
      return 'error.network'
    case 'invalid_response':
      return 'error.invalidResponse'
    case 'unexpected':
      return 'error.unexpected'
  }
}
