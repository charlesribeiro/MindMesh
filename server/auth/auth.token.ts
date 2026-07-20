import { SignJWT, jwtVerify, errors as JoseErrors } from 'jose'
import type { AuthUser, UserRole } from './auth.types'
import { AuthError } from './auth.errors'
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_TTL_SECONDS,
  resolveJwtSecret,
} from './auth.config'

export type AuthTokenClaims = {
  sub: string
  email: string
  displayName: string
  role: UserRole
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(resolveJwtSecret())
}

export async function signAuthToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${JWT_TTL_SECONDS}s`)
    .sign(secretKey())
}

export async function verifyAuthToken(token: string): Promise<AuthTokenClaims> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    })

    const sub = payload.sub
    const email = payload.email
    const displayName = payload.displayName
    const role = payload.role

    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      typeof displayName !== 'string' ||
      (role !== 'client' && role !== 'admin')
    ) {
      throw new AuthError('UNAUTHENTICATED', 'Invalid session')
    }

    return { sub, email, displayName, role }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    if (
      error instanceof JoseErrors.JWTExpired ||
      error instanceof JoseErrors.JWSSignatureVerificationFailed ||
      error instanceof JoseErrors.JWTClaimValidationFailed ||
      error instanceof JoseErrors.JWTInvalid
    ) {
      throw new AuthError('UNAUTHENTICATED', 'Invalid session')
    }
    throw new AuthError('UNAUTHENTICATED', 'Invalid session')
  }
}
