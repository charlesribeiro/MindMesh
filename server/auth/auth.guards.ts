import { GraphQLError } from 'graphql'
import type { CookieStoreLike } from './auth.cookie'
import type { AuthUser, UserRole } from './auth.types'

export type GraphQLContext = {
  requestId: string
  currentUser: AuthUser | null
  cookieStore: CookieStoreLike | null
}

export function createUnauthenticatedError(): GraphQLError {
  return new GraphQLError('Authentication required', {
    extensions: { code: 'UNAUTHENTICATED' },
  })
}

export function createForbiddenError(): GraphQLError {
  return new GraphQLError('Insufficient permissions', {
    extensions: { code: 'FORBIDDEN' },
  })
}

export function createInvalidCredentialsError(): GraphQLError {
  return new GraphQLError('Invalid email or password', {
    extensions: { code: 'INVALID_CREDENTIALS' },
  })
}

export function requireAuthenticatedUser(context: GraphQLContext): AuthUser {
  if (!context.currentUser) {
    throw createUnauthenticatedError()
  }
  return context.currentUser
}

export function requireRole(
  context: GraphQLContext,
  role: UserRole,
): AuthUser {
  const user = requireAuthenticatedUser(context)
  if (user.role !== role) {
    throw createForbiddenError()
  }
  return user
}

export function toGraphQLRole(role: UserRole): 'CLIENT' | 'ADMIN' {
  return role === 'admin' ? 'ADMIN' : 'CLIENT'
}

export function mapAuthUserToGraphQL(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: toGraphQLRole(user.role),
  }
}
