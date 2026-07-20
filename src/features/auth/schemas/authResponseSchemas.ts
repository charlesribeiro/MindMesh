import { z } from 'zod'
import type { AuthUser, UserRole } from '../types/auth'

const graphQLRoleSchema = z.enum(['CLIENT', 'ADMIN'])

export const authUserTransportSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: graphQLRoleSchema,
})

export const loginResponseSchema = z.object({
  login: z.object({
    user: authUserTransportSchema,
  }),
})

export const logoutResponseSchema = z.object({
  logout: z.boolean(),
})

export const meResponseSchema = z.object({
  me: authUserTransportSchema.nullable(),
})

export const adminOverviewResponseSchema = z.object({
  adminOverview: z.object({
    professionalCount: z.number().int().nonnegative(),
    activeProfessionalCount: z.number().int().nonnegative(),
    clientUserCount: z.number().int().nonnegative(),
    adminUserCount: z.number().int().nonnegative(),
  }),
})

export function mapGraphQLRole(role: z.infer<typeof graphQLRoleSchema>): UserRole {
  return role === 'ADMIN' ? 'admin' : 'client'
}

export function mapAuthUserTransport(
  transport: z.infer<typeof authUserTransportSchema>,
): AuthUser {
  return {
    id: transport.id,
    email: transport.email,
    displayName: transport.displayName,
    role: mapGraphQLRole(transport.role),
  }
}
