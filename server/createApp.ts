import { useCookies } from '@whatwg-node/server-plugin-cookies'
import { createSchema, createYoga, maskError } from 'graphql-yoga'
import {
  readAuthTokenFromCookieHeader,
  type CookieStoreLike,
} from './auth/auth.cookie'
import type { GraphQLContext } from './auth/auth.guards'
import { resolveUserFromToken } from './auth/auth.service'
import { resolvers } from './schema/resolvers'
import { typeDefs } from './schema/typeDefs'

export const GRAPHQL_PORT = 4000
export const GRAPHQL_ENDPOINT_PATH = '/graphql'

const DEFAULT_FRONTEND_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
] as const

export function resolveFrontendOrigins(): string[] {
  const configured = process.env.FRONTEND_ORIGIN?.trim()
  if (configured && configured.length > 0) {
    return [configured]
  }
  return [...DEFAULT_FRONTEND_ORIGINS]
}

function isPassThroughErrorCode(code: unknown): boolean {
  return (
    code === 'BAD_USER_INPUT' ||
    code === 'UNAUTHENTICATED' ||
    code === 'FORBIDDEN' ||
    code === 'INVALID_CREDENTIALS'
  )
}

export async function buildGraphQLContext(
  request: Request & { cookieStore?: CookieStoreLike },
): Promise<GraphQLContext> {
  const token = readAuthTokenFromCookieHeader(request.headers.get('cookie'))
  const currentUser = await resolveUserFromToken(token)

  return {
    requestId: crypto.randomUUID(),
    currentUser,
    cookieStore: request.cookieStore ?? null,
  }
}

export function createMindMeshYoga() {
  const schema = createSchema({
    typeDefs,
    resolvers,
  })

  return createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: GRAPHQL_ENDPOINT_PATH,
    graphiql: true,
    plugins: [useCookies()],
    context: async ({ request }) =>
      buildGraphQLContext(
        request as Request & { cookieStore?: CookieStoreLike },
      ),
    maskedErrors: {
      isDev: false,
      maskError(error, message, isDev) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'extensions' in error &&
          isPassThroughErrorCode(
            (error as { extensions?: { code?: unknown } }).extensions?.code,
          ) &&
          error instanceof Error
        ) {
          return error
        }

        return maskError(error, message, isDev)
      },
    },
    cors: {
      origin: resolveFrontendOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-mindmesh-msw-scenario'],
    },
  })
}

export type MindMeshYoga = ReturnType<typeof createMindMeshYoga>
