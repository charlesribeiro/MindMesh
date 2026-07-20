export class AuthError extends Error {
  readonly code:
    | 'INVALID_CREDENTIALS'
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'CONFIGURATION'

  constructor(
    code: AuthError['code'],
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}
