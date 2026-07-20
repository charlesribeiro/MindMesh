import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginRequest, logoutRequest, meRequest } from '../api/authApi'
import type {
  AuthContextValue,
  AuthStatus,
  AuthUser,
  LoginInput,
} from '../types/auth'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const nextUser = await meRequest()
        if (cancelled) {
          return
        }
        setUser(nextUser)
        setStatus(nextUser ? 'authenticated' : 'unauthenticated')
      } catch {
        if (cancelled) {
          return
        }
        setUser(null)
        setStatus('unauthenticated')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const refreshSession = useCallback(async () => {
    setStatus('loading')
    try {
      const nextUser = await meRequest()
      setUser(nextUser)
      setStatus(nextUser ? 'authenticated' : 'unauthenticated')
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const nextUser = await loginRequest(input)
    setUser(nextUser)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login,
      logout,
      refreshSession,
    }),
    [user, status, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
