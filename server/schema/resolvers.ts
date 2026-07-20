import { GraphQLScalarType, Kind, type ValueNode } from 'graphql'
import { GraphQLError } from 'graphql'
import {
  clearAuthCookieOnStore,
  setAuthCookieOnStore,
} from '../auth/auth.cookie'
import { isAuthError } from '../auth/auth.errors'
import {
  createInvalidCredentialsError,
  mapAuthUserToGraphQL,
  requireAuthenticatedUser,
  requireRole,
  type GraphQLContext,
} from '../auth/auth.guards'
import { countDemoUsersByRole } from '../auth/auth.repository'
import { authenticateWithPassword } from '../auth/auth.service'
import { professionalFixtures } from '../../src/domain/professionals/professionalFixtures'
import { submitIntakeService } from '../services/submitIntake'
import { submitIntakeInputSchema } from '../validation/submitIntakeInputSchema'

function parseJsonLiteral(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value)
    case Kind.NULL:
      return null
    case Kind.LIST:
      return ast.values.map(parseJsonLiteral)
    case Kind.OBJECT: {
      const value: Record<string, unknown> = {}
      for (const field of ast.fields) {
        value[field.name.value] = parseJsonLiteral(field.value)
      }
      return value
    }
    default:
      throw new GraphQLError('Invalid JSON literal', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
  }
}

const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON scalar for match criterion values',
  serialize(value: unknown): unknown {
    return value
  },
  parseValue(value: unknown): unknown {
    return value
  },
  parseLiteral(ast: ValueNode): unknown {
    return parseJsonLiteral(ast)
  },
})

function invalidSubmitIntakeInputError(): GraphQLError {
  return new GraphQLError('Invalid SubmitIntakeInput', {
    extensions: {
      code: 'BAD_USER_INPUT',
    },
  })
}

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    health: (): string => 'ok',
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        return null
      }
      return mapAuthUserToGraphQL(context.currentUser)
    },
    adminOverview: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      requireRole(context, 'admin')
      return {
        professionalCount: professionalFixtures.length,
        activeProfessionalCount: professionalFixtures.filter((p) => p.active)
          .length,
        clientUserCount: countDemoUsersByRole('client'),
        adminUserCount: countDemoUsersByRole('admin'),
      }
    },
  },
  Mutation: {
    login: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const { user, token } = await authenticateWithPassword(args.input)
        if (!context.cookieStore) {
          throw new GraphQLError('Cookie store unavailable', {
            extensions: { code: 'UNEXPECTED' },
          })
        }
        await setAuthCookieOnStore(context.cookieStore, token)
        return { user: mapAuthUserToGraphQL(user) }
      } catch (error) {
        if (isAuthError(error) && error.code === 'INVALID_CREDENTIALS') {
          throw createInvalidCredentialsError()
        }
        throw error
      }
    },
    logout: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ): Promise<boolean> => {
      if (context.cookieStore) {
        await clearAuthCookieOnStore(context.cookieStore)
      }
      return true
    },
    submitIntake: (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ): ReturnType<typeof submitIntakeService> => {
      requireAuthenticatedUser(context)

      const parsed = submitIntakeInputSchema.safeParse(args.input)
      if (!parsed.success) {
        throw invalidSubmitIntakeInputError()
      }

      return submitIntakeService(parsed.data)
    },
  },
}
