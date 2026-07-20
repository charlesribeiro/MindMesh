/**
 * GraphQL schema: intake contract + authentication operations.
 * Domain hyphenated values remain Strings; auth roles use GraphQL enums.
 */
export const typeDefs = /* GraphQL */ `
  scalar JSON

  enum UserRole {
    CLIENT
    ADMIN
  }

  type AuthUser {
    id: ID!
    email: String!
    displayName: String!
    role: UserRole!
  }

  type AuthPayload {
    user: AuthUser!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AdminOverview {
    professionalCount: Int!
    activeProfessionalCount: Int!
    clientUserCount: Int!
    adminUserCount: Int!
  }

  type Query {
    health: String!
    me: AuthUser
    adminOverview: AdminOverview!
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
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    submitIntake(input: SubmitIntakeInput!): SubmitIntakePayload!
  }
`
