export type UserRole = 'client' | 'admin'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export type AuthApiErrorKind =
  | 'invalid_credentials'
  | 'unauthenticated'
  | 'forbidden'
  | 'network'
  | 'invalid_response'
  | 'unexpected'
