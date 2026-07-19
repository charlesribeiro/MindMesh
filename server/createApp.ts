import { createSchema, createYoga, maskError } from 'graphql-yoga'
import { resolvers } from './schema/resolvers'
import { typeDefs } from './schema/typeDefs'

/** Vite default origin — keep CORS narrow for local development. */
export const LOCAL_WEB_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
] as const

export const GRAPHQL_PORT = 4000
export const GRAPHQL_ENDPOINT_PATH = '/graphql'

export function createMindMeshYoga() {
  const schema = createSchema({
    typeDefs,
    resolvers,
  })

  return createYoga({
    schema,
    graphqlEndpoint: GRAPHQL_ENDPOINT_PATH,
    graphiql: true,
    maskedErrors: {
      // Never attach originalError/stack to clients, even when NODE_ENV=development.
      isDev: false,
      maskError(error, message, isDev) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'extensions' in error &&
          (error as { extensions?: { code?: unknown } }).extensions?.code ===
            'BAD_USER_INPUT' &&
          error instanceof Error
        ) {
          return error
        }

        return maskError(error, message, isDev)
      },
    },
    cors: {
      origin: [...LOCAL_WEB_ORIGINS],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-mindmesh-msw-scenario'],
    },
  })
}

export type MindMeshYoga = ReturnType<typeof createMindMeshYoga>
