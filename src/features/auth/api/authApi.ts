import { ClientError } from 'graphql-request'
import { requestGraphQL } from '../../../graphql/client'
import {
  AuthApiError,
  logAuthTechnicalError,
} from './authErrors'
import {
  ADMIN_OVERVIEW_QUERY,
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  ME_QUERY,
} from './authOperations'
import {
  adminOverviewResponseSchema,
  loginResponseSchema,
  logoutResponseSchema,
  mapAuthUserTransport,
  meResponseSchema,
} from '../schemas/authResponseSchemas'
import type { AuthUser, LoginInput } from '../types/auth'

function graphqlErrorCode(error: ClientError): string | undefined {
  const code = error.response.errors?.[0]?.extensions?.code
  return typeof code === 'string' ? code : undefined
}

function toAuthApiError(error: unknown): AuthApiError {
  if (error instanceof AuthApiError) {
    return error
  }

  if (error instanceof ClientError) {
    const code = graphqlErrorCode(error)
    if (code === 'INVALID_CREDENTIALS') {
      return new AuthApiError(
        'invalid_credentials',
        'Invalid email or password',
        error,
      )
    }
    if (code === 'UNAUTHENTICATED') {
      return new AuthApiError('unauthenticated', 'Authentication required', error)
    }
    if (code === 'FORBIDDEN') {
      return new AuthApiError('forbidden', 'Insufficient permissions', error)
    }
    if (error.response.errors && error.response.errors.length > 0) {
      return new AuthApiError('unexpected', 'Unexpected GraphQL error', error)
    }
    return new AuthApiError('network', 'Network request failed', error)
  }

  if (error instanceof TypeError) {
    return new AuthApiError('network', 'Network request failed', error)
  }

  return new AuthApiError('unexpected', 'Unexpected auth failure', error)
}

export async function loginRequest(input: LoginInput): Promise<AuthUser> {
  try {
    const raw = await requestGraphQL<unknown, { input: LoginInput }>(
      LOGIN_MUTATION,
      { input },
    )
    const validated = loginResponseSchema.safeParse(raw)
    if (!validated.success) {
      const error = new AuthApiError(
        'invalid_response',
        'Login response failed schema validation',
        validated.error,
      )
      logAuthTechnicalError(error)
      throw error
    }
    return mapAuthUserTransport(validated.data.login.user)
  } catch (error) {
    const apiError = toAuthApiError(error)
    logAuthTechnicalError(apiError)
    throw apiError
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    const raw = await requestGraphQL<unknown, Record<string, never>>(
      LOGOUT_MUTATION,
      {},
    )
    const validated = logoutResponseSchema.safeParse(raw)
    if (!validated.success) {
      const error = new AuthApiError(
        'invalid_response',
        'Logout response failed schema validation',
        validated.error,
      )
      logAuthTechnicalError(error)
      throw error
    }
  } catch (error) {
    const apiError = toAuthApiError(error)
    logAuthTechnicalError(apiError)
    throw apiError
  }
}

export async function meRequest(): Promise<AuthUser | null> {
  try {
    const raw = await requestGraphQL<unknown, Record<string, never>>(ME_QUERY, {})
    const validated = meResponseSchema.safeParse(raw)
    if (!validated.success) {
      const error = new AuthApiError(
        'invalid_response',
        'Me response failed schema validation',
        validated.error,
      )
      logAuthTechnicalError(error)
      throw error
    }
    if (!validated.data.me) {
      return null
    }
    return mapAuthUserTransport(validated.data.me)
  } catch (error) {
    const apiError = toAuthApiError(error)
    logAuthTechnicalError(apiError)
    throw apiError
  }
}

export type AdminOverview = {
  professionalCount: number
  activeProfessionalCount: number
  clientUserCount: number
  adminUserCount: number
}

export async function adminOverviewRequest(): Promise<AdminOverview> {
  try {
    const raw = await requestGraphQL<unknown, Record<string, never>>(
      ADMIN_OVERVIEW_QUERY,
      {},
    )
    const validated = adminOverviewResponseSchema.safeParse(raw)
    if (!validated.success) {
      const error = new AuthApiError(
        'invalid_response',
        'Admin overview response failed schema validation',
        validated.error,
      )
      logAuthTechnicalError(error)
      throw error
    }
    return validated.data.adminOverview
  } catch (error) {
    const apiError = toAuthApiError(error)
    logAuthTechnicalError(apiError)
    throw apiError
  }
}
