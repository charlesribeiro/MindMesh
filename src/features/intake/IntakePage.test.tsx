import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { IntakePage } from './IntakePage'

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

describe('IntakePage', () => {
  it('renders the intake page in English', () => {
    render(<IntakePage />)

    expect(
      screen.getByRole('heading', { name: 'Administrative intake' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Care preferences' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('renders Brazilian Portuguese strings after language change', async () => {
    render(<IntakePage />)

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
    render(<IntakePage />)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('Select at least one preferred period.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Enter a valid maximum price greater than zero.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
    expect(
      screen.getByRole('heading', { name: 'Care preferences' }),
    ).toBeInTheDocument()
  })

  it('progresses through all steps', async () => {
    const user = userEvent.setup()
    render(<IntakePage />)

    await goToReview(user)

    expect(
      screen.getByRole('heading', { name: 'Review your intake' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit intake' })).toBeInTheDocument()
  })

  it('preserves values after navigating backward', async () => {
    const user = userEvent.setup()
    render(<IntakePage />)

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

  it('preserves form data when the language changes', async () => {
    const user = userEvent.setup()
    render(<IntakePage />)

    await fillPreferences(user)
    await i18n.changeLanguage('pt-BR')

    expect(await screen.findByRole('radio', { name: 'Online' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Manhã' })).toBeChecked()
    expect(
      screen.getByLabelText(/Valor máximo aproximado por sessão/i),
    ).toHaveValue(120)
  })

  it('allows editing data from the review step', async () => {
    const user = userEvent.setup()
    render(<IntakePage />)

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
    const submitFn = vi.fn()
    render(<IntakePage submitFn={submitFn} />)

    await goToReview(user)
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    expect(
      await screen.findByText('Consent is required before submitting.'),
    ).toBeInTheDocument()
    expect(submitFn).not.toHaveBeenCalled()
  })

  it('prevents duplicate submission', async () => {
    const user = userEvent.setup()
    let resolveSubmit: ((value: { id: string }) => void) | undefined
    const submitFn = vi.fn(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolveSubmit = resolve
        }),
    )

    render(<IntakePage submitFn={submitFn} />)

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
      expect(submitFn).toHaveBeenCalledTimes(1)
    })

    resolveSubmit?.({ id: 'intake-dup-1' })

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
  })

  it('shows the success state after submission', async () => {
    const user = userEvent.setup()
    const submitFn = vi.fn(async () => ({ id: 'intake-test-123' }))
    render(<IntakePage submitFn={submitFn} />)

    await goToReview(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: /I have read the privacy notice/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
    expect(screen.getByText('intake-test-123')).toBeInTheDocument()
  })
})
