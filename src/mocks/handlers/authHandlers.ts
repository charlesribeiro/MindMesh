import { HttpResponse, http } from 'msw'

const CLIENT_USER = {
  id: 'user-client-demo',
  email: 'client@mindmesh.local',
  displayName: 'Demo Client',
  role: 'CLIENT' as const,
}

const ADMIN_USER = {
  id: 'user-admin-demo',
  email: 'admin@mindmesh.local',
  displayName: 'Demo Admin',
  role: 'ADMIN' as const,
}

type GraphQLBody = {
  query?: string
  variables?: {
    input?: {
      email?: string
      password?: string
    }
  }
}

/** Mutable session for MSW browser/server tests (cookie-like). */
let mswSessionUser: typeof CLIENT_USER | typeof ADMIN_USER | null = null

export function resetMswAuthSession(): void {
  mswSessionUser = null
}

export function setMswAuthSession(role: 'client' | 'admin' | null): void {
  if (role === 'client') {
    mswSessionUser = CLIENT_USER
    return
  }
  if (role === 'admin') {
    mswSessionUser = ADMIN_USER
    return
  }
  mswSessionUser = null
}

export function getMswAuthSession(): typeof mswSessionUser {
  return mswSessionUser
}

function isAuthOperation(query: string): boolean {
  return (
    query.includes('mutation Login') ||
    query.includes('mutation Logout') ||
    query.includes('query Me') ||
    query.includes('query AdminOverview')
  )
}

export const authHandlers = [
  http.post('*/graphql', async ({ request }) => {
    let body: GraphQLBody
    try {
      body = (await request.clone().json()) as GraphQLBody
    } catch {
      return undefined
    }

    const query = body.query ?? ''
    if (!isAuthOperation(query)) {
      return undefined
    }

    if (query.includes('mutation Login')) {
      const email = body.variables?.input?.email?.trim().toLowerCase()
      const password = body.variables?.input?.password
      if (
        email === 'client@mindmesh.local' &&
        password === 'MindMesh-Client-Dev-1!'
      ) {
        mswSessionUser = CLIENT_USER
        return HttpResponse.json({
          data: { login: { user: CLIENT_USER } },
        })
      }
      if (
        email === 'admin@mindmesh.local' &&
        password === 'MindMesh-Admin-Dev-1!'
      ) {
        mswSessionUser = ADMIN_USER
        return HttpResponse.json({
          data: { login: { user: ADMIN_USER } },
        })
      }
      return HttpResponse.json({
        data: null,
        errors: [
          {
            message: 'Invalid email or password',
            extensions: { code: 'INVALID_CREDENTIALS' },
          },
        ],
      })
    }

    if (query.includes('mutation Logout')) {
      mswSessionUser = null
      return HttpResponse.json({ data: { logout: true } })
    }

    if (query.includes('query Me')) {
      return HttpResponse.json({
        data: { me: mswSessionUser },
      })
    }

    if (query.includes('query AdminOverview')) {
      if (!mswSessionUser) {
        return HttpResponse.json({
          data: null,
          errors: [
            {
              message: 'Authentication required',
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
        })
      }
      if (mswSessionUser.role !== 'ADMIN') {
        return HttpResponse.json({
          data: null,
          errors: [
            {
              message: 'Insufficient permissions',
              extensions: { code: 'FORBIDDEN' },
            },
          ],
        })
      }
      return HttpResponse.json({
        data: {
          adminOverview: {
            professionalCount: 6,
            activeProfessionalCount: 5,
            clientUserCount: 1,
            adminUserCount: 1,
          },
        },
      })
    }

    return undefined
  }),
]
