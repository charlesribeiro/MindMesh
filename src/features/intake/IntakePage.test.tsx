import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { http, HttpResponse } from 'msw'
import { resolveGraphQLEndpoint } from '../../graphql/client'
import { setMswAuthSession } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { IntakePage } from './IntakePage'

const graphqlUrl = resolveGraphQLEndpoint()

beforeEach(() => {
  setMswAuthSession('client')
})


function renderIntakePage() {
  return render(
    <MemoryRouter initialEntries={['/intake']}>
      <Routes>
        <Route path="/intake" element={<IntakePage />} />
        <Route
          path="/matches"
          element={<div data-testid="matches-route">Matches route</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

const validDescription =
  'Optional notes about scheduling preferences for administrative matching.'

async function fillPreferences(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(screen.getByRole('radio', { name: 'Online' }))
  await user.click(screen.getByRole('checkbox', { name: 'Morning' }))
  await user.click(screen.getByRole('checkbox', { name: 'Evening' }))
  await user.type(
    screen.getByLabelText(/Approximate maximum price per session/i),
    '120',
  )
}

async function fillSupportNeeds(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.selectOptions(
    screen.getByLabelText(/General support topic/i),
    'work',
  )
  await user.type(
    screen.getByLabelText(/Additional details/i),
    validDescription,
  )
  await user.click(screen.getByRole('radio', { name: 'Female' }))
  await user.click(screen.getByRole('radio', { name: 'English' }))
}

async function goToReview(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await fillPreferences(user)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Support preferences' })
  await fillSupportNeeds(user)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Review your intake' })
}

async function consentAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(
    screen.getByRole('checkbox', {
      name: /I have read the privacy notice/i,
    }),
  )
  await user.click(screen.getByRole('button', { name: 'Submit intake' }))
}

describe('IntakePage', () => {
  it('renders the intake page in English', () => {
    renderIntakePage()

    expect(
      screen.getByRole('heading', { name: 'Administrative intake' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Care preferences' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('renders Brazilian Portuguese strings after language change', async () => {
    renderIntakePage()

    await i18n.changeLanguage('pt-BR')

    expect(
      await screen.findByRole('heading', { name: 'Triagem administrativa' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Preferências de atendimento' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument()
  })

  it('blocks progression and shows accessible validation messages', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('Select at least one preferred period.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Enter a valid maximum price greater than zero.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
  })

  it('progresses through all steps', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await goToReview(user)

    expect(
      screen.getByRole('heading', { name: 'Review your intake' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit intake' })).toBeInTheDocument()
  })

  it('preserves values after navigating backward', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await fillPreferences(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Support preferences' })

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('heading', { name: 'Care preferences' })

    expect(screen.getByRole('radio', { name: 'Online' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Morning' })).toBeChecked()
    expect(
      screen.getByLabelText(/Approximate maximum price per session/i),
    ).toHaveValue(120)
  })

  it('allows editing data from the review step', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await goToReview(user)

    const preferences = screen.getByRole('region', {
      name: 'Care preferences',
    })
    expect(within(preferences).getByText('Online')).toBeInTheDocument()
    expect(within(preferences).getByText(/\$120/)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Edit care preferences' }),
    )
    await screen.findByRole('heading', { name: 'Care preferences' })
    expect(screen.getByRole('radio', { name: 'Online' })).toBeChecked()
  })

  it('requires consent before submission', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await goToReview(user)
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    expect(
      await screen.findByText('Consent is required before submitting.'),
    ).toBeInTheDocument()
  })

  it('submits through GraphQL and shows success without navigating yet', async () => {
    const user = userEvent.setup()
    renderIntakePage()

    await goToReview(user)
    await consentAndSubmit(user)

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
    expect(
      screen.getByRole('link', { name: 'View match suggestions' }),
    ).toHaveAttribute('href', '/matches')
    expect(screen.queryByTestId('matches-route')).not.toBeInTheDocument()
  })

  it('prevents duplicate submission while pending', async () => {
    const user = userEvent.setup()
    let requestCount = 0

    server.use(
      http.post(graphqlUrl, async () => {
        requestCount += 1
        await new Promise((resolve) => {
          setTimeout(resolve, 200)
        })
        return HttpResponse.json({
          data: {
            submitIntake: {
              intake: {
                id: 'intake-demo-dup',
                modality: 'online',
                preferredPeriods: ['morning', 'evening'],
                maxSessionPrice: 120,
                supportTopic: 'work',
                description: validDescription,
                genderPreference: 'female',
                preferredLanguage: 'en',
                consentedAt: '2026-01-15T12:00:00.000Z',
              },
              matches: [],
            },
          },
        })
      }),
    )

    renderIntakePage()
    await goToReview(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: /I have read the privacy notice/i,
      }),
    )

    const submitButton = screen.getByRole('button', { name: 'Submit intake' })
    await user.click(submitButton)
    await user.click(submitButton)

    await waitFor(() => {
      expect(requestCount).toBe(1)
    })

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
  })

  it('shows an accessible English error, focuses it, and preserves values', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(graphqlUrl, () =>
        HttpResponse.json({
          errors: [{ message: 'Simulated failure' }],
        }),
      ),
    )

    renderIntakePage()
    await goToReview(user)
    await consentAndSubmit(user)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      /The server could not complete your intake/i,
    )
    expect(alert).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled()
    expect(screen.getByRole('checkbox', {
      name: /I have read the privacy notice/i,
    })).toBeChecked()
  })

  it('retries after failure when the network recovers', async () => {
    const user = userEvent.setup()
    let attempts = 0

    server.use(
      http.post(graphqlUrl, () => {
        attempts += 1
        if (attempts === 1) {
          return HttpResponse.error()
        }

        return HttpResponse.json({
          data: {
            submitIntake: {
              intake: {
                id: 'intake-demo-retry',
                modality: 'online',
                preferredPeriods: ['morning', 'evening'],
                maxSessionPrice: 120,
                supportTopic: 'work',
                description: validDescription,
                genderPreference: 'female',
                preferredLanguage: 'en',
                consentedAt: '2026-01-15T12:00:00.000Z',
              },
              matches: [],
            },
          },
        })
      }),
    )

    renderIntakePage()
    await goToReview(user)
    await consentAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not reach the server/i,
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
    expect(attempts).toBe(2)
  })

  it('shows Brazilian Portuguese error text', async () => {
    const user = userEvent.setup()
    await i18n.changeLanguage('pt-BR')

    server.use(
      http.post(graphqlUrl, () =>
        HttpResponse.json({
          data: {
            submitIntake: {
              intake: { id: 'broken' },
              matches: 'bad',
            },
          },
        }),
      ),
    )

    renderIntakePage()

    await user.click(screen.getByRole('radio', { name: 'Online' }))
    await user.click(screen.getByRole('checkbox', { name: 'Manhã' }))
    await user.click(screen.getByRole('checkbox', { name: 'Noite' }))
    await user.type(
      screen.getByLabelText(/Valor máximo aproximado por sessão/i),
      '120',
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await screen.findByRole('heading', { name: 'Preferências de apoio' })
    await user.selectOptions(
      screen.getByLabelText(/Tema geral de apoio/i),
      'work',
    )
    await user.type(
      screen.getByLabelText(/Detalhes adicionais/i),
      validDescription,
    )
    await user.click(screen.getByRole('radio', { name: 'Feminino' }))
    await user.click(screen.getByRole('radio', { name: 'Inglês' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await screen.findByRole('heading', { name: 'Revise sua triagem' })
    await user.click(
      screen.getByRole('checkbox', {
        name: /Li o aviso de privacidade/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Enviar triagem' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /resposta inesperada/i,
    )
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled()
  })

  it('does not navigate to matches until the user follows the success link', async () => {
    const user = userEvent.setup()
    renderIntakePage()
    await goToReview(user)
    await consentAndSubmit(user)

    const link = await screen.findByRole('link', {
      name: 'View match suggestions',
    })
    await user.click(link)

    expect(await screen.findByTestId('matches-route')).toBeInTheDocument()
  })
})
