import bcrypt from 'bcryptjs'
import { AuthError } from './auth.errors'
import { loginInputSchema } from './auth.schema'
import {
  findUserByEmail,
  findUserById,
  toAuthUser,
} from './auth.repository'
import { signAuthToken, verifyAuthToken } from './auth.token'
import type { AuthUser } from './auth.types'

export async function authenticateWithPassword(
  rawInput: unknown,
): Promise<{ user: AuthUser; token: string }> {
  const parsed = loginInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
  }

  const stored = findUserByEmail(parsed.data.email)
  if (!stored) {
    // Constant-time-ish delay path: still run a compare against a dummy hash would be ideal;
    // for demo we keep a single generic failure without email enumeration messaging.
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    stored.passwordHash,
  )
  if (!passwordMatches) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
  }

  const user = toAuthUser(stored)
  const token = await signAuthToken(user)
  return { user, token }
}

export async function resolveUserFromToken(
  token: string | null,
): Promise<AuthUser | null> {
  if (!token) {
    return null
  }

  try {
    const claims = await verifyAuthToken(token)
    const stored = findUserById(claims.sub)
    if (!stored) {
      return null
    }
    return toAuthUser(stored)
  } catch {
    return null
  }
}
