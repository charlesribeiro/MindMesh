import type { AuthUser, StoredUser, UserRole } from './auth.types'

/**
 * In-memory demo users. Replace with a real repository / IdP later.
 * Password hashes are bcrypt; plaintext never stored or returned.
 */
const DEMO_USERS: readonly StoredUser[] = [
  {
    id: 'user-client-demo',
    email: 'client@mindmesh.local',
    displayName: 'Demo Client',
    role: 'client',
    passwordHash:
      '$2b$10$QBJBmu1pynQVKn4O4ybGQeBBKqOmVsQvLYf2L0j5o2sG1HbgU0my6',
  },
  {
    id: 'user-admin-demo',
    email: 'admin@mindmesh.local',
    displayName: 'Demo Admin',
    role: 'admin',
    passwordHash:
      '$2b$10$5xPahWtv92tB75YecOeQ7eyydKJHqAQwKcsAnk1JeS0zbXlmwiaCi',
  },
]

export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.trim().toLowerCase()
  return DEMO_USERS.find((user) => user.email === normalized) ?? null
}

export function findUserById(id: string): StoredUser | null {
  return DEMO_USERS.find((user) => user.id === id) ?? null
}

export function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  }
}

export function countDemoUsersByRole(role: UserRole): number {
  return DEMO_USERS.filter((user) => user.role === role).length
}
