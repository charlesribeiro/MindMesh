export const LOGIN_MUTATION = /* GraphQL */ `
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

export const LOGOUT_MUTATION = /* GraphQL */ `
  mutation Logout {
    logout
  }
`

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      email
      displayName
      role
    }
  }
`

export const ADMIN_OVERVIEW_QUERY = /* GraphQL */ `
  query AdminOverview {
    adminOverview {
      professionalCount
      activeProfessionalCount
      clientUserCount
      adminUserCount
    }
  }
`
