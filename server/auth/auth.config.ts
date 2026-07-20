import { AuthError } from './auth.errors'

const DEV_FALLBACK_SECRET = 'mindmesh-dev-jwt-secret-change-me'
export const JWT_ISSUER = 'mindmesh'
export const JWT_AUDIENCE = 'mindmesh-web'
/** Session lifetime: 8 hours */
export const JWT_TTL_SECONDS = 60 * 60 * 8

export function resolveJwtSecret(): string {
  const configured = process.env.JWT_SECRET?.trim()
  if (configured && configured.length > 0) {
    return configured
  }

  if (process.env.NODE_ENV === 'production') {
    throw new AuthError(
      'CONFIGURATION',
      'JWT_SECRET environment variable is required in production',
    )
  }

  return DEV_FALLBACK_SECRET
}
