import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IntakeForm } from './IntakeForm'

const validDescription =
  'I am looking for administrative support matching around work stress and sleep routines.'

async function fillPreferences(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(screen.getByRole('radio', { name: 'Online' }))
  await user.click(screen.getByRole('checkbox', { name: 'Morning' }))
  await user.click(screen.getByRole('checkbox', { name: 'Evening' }))
  await user.type(
    screen.getByLabelText(/Approximate maximum session price/i),
    '120',
  )
}

async function fillSupportNeeds(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.selectOptions(
    screen.getByLabelText(/General reason for seeking support/i),
    'work-or-school',
  )
  await user.type(
    screen.getByLabelText(/Describe what you are looking for/i),
    validDescription,
  )
  await user.click(screen.getByRole('radio', { name: 'Woman' }))
}

async function goToReview(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await fillPreferences(user)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Support needs' })
  await fillSupportNeeds(user)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Review' })
}

describe('IntakeForm', () => {
  it('blocks progression and shows field errors when preferences are invalid', async () => {
    const user = userEvent.setup()
    render(<IntakeForm />)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('Select at least one preferred period.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Enter an approximate maximum session price.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Preferences' }),
    ).toBeInTheDocument()
  })

  it('preserves data when navigating backward', async () => {
    const user = userEvent.setup()
    render(<IntakeForm />)

    await fillPreferences(user)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Support needs' })

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('heading', { name: 'Preferences' })

    expect(screen.getByRole('radio', { name: 'Online' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Morning' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Evening' })).toBeChecked()
    expect(
      screen.getByLabelText(/Approximate maximum session price/i),
    ).toHaveValue(120)
  })

  it('shows structured review details and allows editing a prior step', async () => {
    const user = userEvent.setup()
    render(<IntakeForm />)

    await goToReview(user)

    const preferences = screen.getByRole('region', { name: 'Preferences' })
    expect(within(preferences).getByText('Online')).toBeInTheDocument()
    expect(
      within(preferences).getByText('Morning, Evening'),
    ).toBeInTheDocument()
    expect(within(preferences).getByText('$120')).toBeInTheDocument()

    const support = screen.getByRole('region', { name: 'Support needs' })
    expect(within(support).getByText('Work or school')).toBeInTheDocument()
    expect(within(support).getByText(validDescription)).toBeInTheDocument()
    expect(within(support).getByText('Woman')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit preferences' }))
    await screen.findByRole('heading', { name: 'Preferences' })
    expect(screen.getByRole('radio', { name: 'Online' })).toBeChecked()
  })

  it('requires consent before submission', async () => {
    const user = userEvent.setup()
    const submitFn = vi.fn()
    render(<IntakeForm submitFn={submitFn} />)

    await goToReview(user)
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    expect(
      await screen.findByText('Consent is required before submitting.'),
    ).toBeInTheDocument()
    expect(submitFn).not.toHaveBeenCalled()
  })

  it('submits successfully and shows the success state', async () => {
    const user = userEvent.setup()
    const submitFn = vi.fn(async () => ({
      id: 'intake-test-123',
    }))

    render(<IntakeForm submitFn={submitFn} />)

    await goToReview(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: /I understand this is a fictional demo/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    await waitFor(() => {
      expect(submitFn).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(/Intake submitted/i)
    expect(screen.getByText('intake-test-123')).toBeInTheDocument()
  })

  it('shows an error state when submission fails and keeps the form', async () => {
    const user = userEvent.setup()
    const submitFn = vi.fn(async () => {
      throw new Error('Unable to submit intake. Please try again.')
    })

    render(<IntakeForm submitFn={submitFn} />)

    await goToReview(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: /I understand this is a fictional demo/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Submit intake' }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Unable to submit intake. Please try again.')
    expect(
      screen.getByRole('heading', { name: 'Review' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Submit intake' }),
    ).toBeEnabled()
  })
})
