import { describe, expect, it } from 'vitest'
import { AUTH_COOKIE_NAME } from './auth/auth.cookie'
import { signAuthToken } from './auth/auth.token'
import { createMindMeshYoga } from './createApp'
import { SUBMIT_INTAKE_MUTATION } from '../src/graphql/operations/submitIntakeOperation'

const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        displayName
        role
      }
    }
  }
`

const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logout
  }
`

const ME = /* GraphQL */ `
  query Me {
    me {
      id
      email
      role
    }
  }
`

const ADMIN_OVERVIEW = /* GraphQL */ `
  query AdminOverview {
    adminOverview {
      professionalCount
      activeProfessionalCount
      clientUserCount
      adminUserCount
    }
  }
`

const validIntake = {
  modality: 'online',
  preferredPeriods: ['morning'],
  maxSessionPrice: 150,
  supportTopic: 'anxiety',
  description: null,
  genderPreference: 'no-preference',
  preferredLanguage: 'en',
  consent: true,
}

function getSetCookie(response: Response): string[] {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[]
  }
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie()
  }
  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

function cookieHeaderFromSetCookie(setCookies: string[]): string {
  return setCookies
    .map((value) => value.split(';')[0] ?? '')
    .filter(Boolean)
    .join('; ')
}

async function postGraphql(
  body: unknown,
  cookie?: string,
): Promise<Response> {
  const yoga = createMindMeshYoga()
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
  }
  if (cookie) {
    headers.cookie = cookie
  }
  return yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

async function loginAs(
  email: string,
  password: string,
): Promise<{ cookie: string; json: unknown }> {
  const response = await postGraphql({
    query: LOGIN,
    variables: { input: { email, password } },
  })
  const json = await response.json()
  const setCookies = getSetCookie(response)
  expect(setCookies.some((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`))).toBe(
    true,
  )
  return { cookie: cookieHeaderFromSetCookie(setCookies), json }
}

describe('auth GraphQL API', () => {
  it('logs in with valid credentials and sets an HttpOnly cookie', async () => {
    const { json, cookie } = await loginAs(
      'client@mindmesh.local',
      'MindMesh-Client-Dev-1!',
    )
    expect(json).toMatchObject({
      data: {
        login: {
          user: {
            email: 'client@mindmesh.local',
            role: 'CLIENT',
          },
        },
      },
    })
    expect(cookie).toContain(AUTH_COOKIE_NAME)
    expect(JSON.stringify(json)).not.toMatch(/password|MindMesh-Client/i)
  })

  it('rejects invalid email with a generic credentials error', async () => {
    const response = await postGraphql({
      query: LOGIN,
      variables: {
        input: { email: 'nobody@mindmesh.local', password: 'whatever' },
      },
    })
    const json = await response.json()
    expect(json.data).toBeNull()
    expect(json.errors[0].message).toBe('Invalid email or password')
    expect(json.errors[0].extensions.code).toBe('INVALID_CREDENTIALS')
  })

  it('rejects invalid password with a generic credentials error', async () => {
    const response = await postGraphql({
      query: LOGIN,
      variables: {
        input: {
          email: 'client@mindmesh.local',
          password: 'wrong-password',
        },
      },
    })
    const json = await response.json()
    expect(json.errors[0].extensions.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns the current user from me when authenticated', async () => {
    const { cookie } = await loginAs(
      'admin@mindmesh.local',
      'MindMesh-Admin-Dev-1!',
    )
    const response = await postGraphql({ query: ME }, cookie)
    const json = await response.json()
    expect(json.data.me.email).toBe('admin@mindmesh.local')
    expect(json.data.me.role).toBe('ADMIN')
  })

  it('returns null from me when anonymous', async () => {
    const response = await postGraphql({ query: ME })
    const json = await response.json()
    expect(json.errors).toBeUndefined()
    expect(json.data.me).toBeNull()
  })

  it('rejects expired tokens', async () => {
    const { SignJWT } = await import('jose')
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'mindmesh-dev-jwt-secret-change-me',
    )
    const token = await new SignJWT({
      email: 'client@mindmesh.local',
      displayName: 'Demo Client',
      role: 'client',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-client-demo')
      .setIssuer('mindmesh')
      .setAudience('mindmesh-web')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(secret)

    const response = await postGraphql(
      { query: ME },
      `${AUTH_COOKIE_NAME}=${token}`,
    )
    const json = await response.json()
    expect(json.data.me).toBeNull()
  })

  it('rejects tokens with an invalid signature', async () => {
    const user = {
      id: 'user-client-demo',
      email: 'client@mindmesh.local',
      displayName: 'Demo Client',
      role: 'client' as const,
    }
    const original = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'other-secret-for-signing'
    const token = await signAuthToken(user)
    if (original === undefined) {
      delete process.env.JWT_SECRET
    } else {
      process.env.JWT_SECRET = original
    }

    const response = await postGraphql(
      { query: ME },
      `${AUTH_COOKIE_NAME}=${token}`,
    )
    const json = (await response.json()) as {
      data?: { me: unknown }
      errors?: unknown
    }
    expect(json.errors).toBeUndefined()
    expect(json.data?.me).toBeNull()
  })

  it('clears the cookie on logout', async () => {
    const { cookie } = await loginAs(
      'client@mindmesh.local',
      'MindMesh-Client-Dev-1!',
    )
    const response = await postGraphql({ query: LOGOUT }, cookie)
    const setCookies = getSetCookie(response)
    expect(setCookies.some((c) => c.includes(`${AUTH_COOKIE_NAME}=`))).toBe(
      true,
    )
    expect(
      setCookies.some(
        (c) => /Max-Age=0/i.test(c) || /Expires=Thu, 01 Jan 1970/i.test(c),
      ),
    ).toBe(true)
    const json = await response.json()
    expect(json.data.logout).toBe(true)
  })

  it('rejects unauthenticated intake submission', async () => {
    const response = await postGraphql({
      query: SUBMIT_INTAKE_MUTATION,
      variables: { input: validIntake },
    })
    const json = await response.json()
    expect(json.data).toBeNull()
    expect(json.errors[0].extensions.code).toBe('UNAUTHENTICATED')
  })

  it('allows an authenticated client to submit intake', async () => {
    const { cookie } = await loginAs(
      'client@mindmesh.local',
      'MindMesh-Client-Dev-1!',
    )
    const response = await postGraphql(
      {
        query: SUBMIT_INTAKE_MUTATION,
        variables: { input: validIntake },
      },
      cookie,
    )
    const json = await response.json()
    expect(json.errors).toBeUndefined()
    expect(json.data.submitIntake.matches.length).toBeGreaterThan(0)
  })

  it('forbids clients from adminOverview', async () => {
    const { cookie } = await loginAs(
      'client@mindmesh.local',
      'MindMesh-Client-Dev-1!',
    )
    const response = await postGraphql({ query: ADMIN_OVERVIEW }, cookie)
    const json = await response.json()
    expect(json.errors[0].extensions.code).toBe('FORBIDDEN')
  })

  it('allows admins to access adminOverview', async () => {
    const { cookie } = await loginAs(
      'admin@mindmesh.local',
      'MindMesh-Admin-Dev-1!',
    )
    const response = await postGraphql({ query: ADMIN_OVERVIEW }, cookie)
    const json = await response.json()
    expect(json.errors).toBeUndefined()
    expect(json.data.adminOverview.professionalCount).toBeGreaterThan(0)
  })
})
