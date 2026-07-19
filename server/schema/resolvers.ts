import { GraphQLScalarType, Kind, type ValueNode } from 'graphql'
import { GraphQLError } from 'graphql'
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
  },
  Mutation: {
    submitIntake: (
      _parent: unknown,
      args: { input: unknown },
    ): ReturnType<typeof submitIntakeService> => {
      const parsed = submitIntakeInputSchema.safeParse(args.input)
      if (!parsed.success) {
        throw invalidSubmitIntakeInputError()
      }

      return submitIntakeService(parsed.data)
    },
  },
}
