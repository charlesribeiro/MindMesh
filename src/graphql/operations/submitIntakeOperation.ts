export const SUBMIT_INTAKE_MUTATION = /* GraphQL */ `
  mutation SubmitIntake($input: SubmitIntakeInput!) {
    submitIntake(input: $input) {
      intake {
        id
        modality
        preferredPeriods
        maxSessionPrice
        supportTopic
        description
        genderPreference
        preferredLanguage
        consentedAt
      }
      matches {
        score
        quality
        matchedCriteria {
          id
          points
          matched
          intakeValue
          professionalValue
        }
        unmatchedCriteria {
          id
          points
          matched
          intakeValue
          professionalValue
        }
        professional {
          id
          displayName
          modalities
          availablePeriods
          sessionPrice
          languages
          supportTopics
          gender
        }
      }
    }
  }
`

export type SubmitIntakeInputVariables = {
  input: {
    modality: string
    preferredPeriods: string[]
    maxSessionPrice: number
    supportTopic: string
    description: string | null
    genderPreference: string
    preferredLanguage: string
    consent: true
  }
}
