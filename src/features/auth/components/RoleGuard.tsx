import type { ReactNode } from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import type { UserRole } from '../types/auth'

export function RoleGuard({
  role,
  children,
}: {
  role: UserRole
  children: ReactNode
}) {
  return <ProtectedRoute role={role}>{children}</ProtectedRoute>
}
