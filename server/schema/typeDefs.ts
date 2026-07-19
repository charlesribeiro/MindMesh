/**
 * GraphQL schema aligned with the frontend SubmitIntake operation.
 * Domain values that contain hyphens (e.g. in-person, pt-BR) are Strings;
 * Zod enforces allowed values after GraphQL shape validation.
 */
export const typeDefs = /* GraphQL */ `
  """
  Arbitrary JSON values used for match criterion intake/professional values.
  """
  scalar JSON

  type Query {
    """
    Lightweight health check for local development.
    """
    health: String!
  }

  input SubmitIntakeInput {
    modality: String!
    preferredPeriods: [String!]!
    maxSessionPrice: Float!
    supportTopic: String!
    description: String
    genderPreference: String!
    preferredLanguage: String!
    consent: Boolean!
  }

  type Intake {
    id: String!
    modality: String!
    preferredPeriods: [String!]!
    maxSessionPrice: Float!
    supportTopic: String!
    description: String
    genderPreference: String!
    preferredLanguage: String!
    consentedAt: String!
  }

  type Professional {
    id: String!
    displayName: String!
    modalities: [String!]!
    availablePeriods: [String!]!
    sessionPrice: Int!
    languages: [String!]!
    supportTopics: [String!]!
    gender: String!
  }

  type MatchCriterion {
    id: String!
    points: Int!
    matched: Boolean!
    intakeValue: JSON
    professionalValue: JSON
  }

  type ProfessionalMatch {
    score: Int!
    quality: String!
    matchedCriteria: [MatchCriterion!]!
    unmatchedCriteria: [MatchCriterion!]!
    professional: Professional!
  }

  type SubmitIntakePayload {
    intake: Intake!
    matches: [ProfessionalMatch!]!
  }

  type Mutation {
    submitIntake(input: SubmitIntakeInput!): SubmitIntakePayload!
  }
`
