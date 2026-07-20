export type UserRole = 'client' | 'admin'

/** Safe user object exposed to GraphQL and the frontend — never includes password. */
export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
}

/** Internal persisted shape — password hash never leaves the repository layer. */
export type StoredUser = AuthUser & {
  passwordHash: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type GraphQLUserRole = 'CLIENT' | 'ADMIN'
