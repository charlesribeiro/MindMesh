export const AUTH_COOKIE_NAME = 'mindmesh_session'

export type CookieStoreLike = {
  get: (name: string) => Promise<{ value: string } | null | undefined>
  set: (
    init:
      | string
      | {
          name: string
          value: string
          path?: string
          expires?: Date | null
          sameSite?: 'lax' | 'strict' | 'none'
          httpOnly?: boolean
          secure?: boolean
        },
    value?: string,
  ) => Promise<void>
}

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === 'production'
}

/** Session lifetime mirrored from JWT TTL (8 hours). */
const AUTH_COOKIE_MAX_AGE_MS = 60 * 60 * 8 * 1000

export async function setAuthCookieOnStore(
  cookieStore: CookieStoreLike,
  token: string,
): Promise<void> {
  await cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    path: '/',
    expires: new Date(Date.now() + AUTH_COOKIE_MAX_AGE_MS),
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecureCookie(),
  })
}

export async function clearAuthCookieOnStore(
  cookieStore: CookieStoreLike,
): Promise<void> {
  await cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    expires: new Date(0),
    sameSite: 'lax',
    httpOnly: true,
    secure: isSecureCookie(),
  })
}

export function readAuthTokenFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) {
    return null
  }

  const segments = cookieHeader.split(';')
  for (const segment of segments) {
    const trimmed = segment.trim()
    const separator = trimmed.indexOf('=')
    if (separator <= 0) {
      continue
    }
    const name = trimmed.slice(0, separator)
    if (name !== AUTH_COOKIE_NAME) {
      continue
    }
    const rawValue = trimmed.slice(separator + 1)
    try {
      return decodeURIComponent(rawValue)
    } catch {
      return rawValue
    }
  }

  return null
}
