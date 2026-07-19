import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import type { IntakeSubmissionPayload } from '../intake/types/intake'
import { MatchingResultsPage } from './MatchingResultsPage'

const sampleIntake: IntakeSubmissionPayload = {
  modality: 'online',
  preferredPeriods: ['morning', 'evening'],
  maxSessionPrice: 130,
  supportTopic: 'anxiety',
  description: null,
  genderPreference: 'female',
  preferredLanguage: 'en',
  consent: true,
}

function renderMatches(state?: { intake: IntakeSubmissionPayload }) {
  return render(
    <MemoryRouter
      initialEntries={[
        state
          ? { pathname: '/matches', state }
          : { pathname: '/matches' },
      ]}
    >
      <Routes>
        <Route path="/matches" element={<MatchingResultsPage />} />
        <Route path="/intake" element={<div>Intake route</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MatchingResultsPage', () => {
  it('renders ranked results with matched and unmatched explanations', () => {
    renderMatches({ intake: sampleIntake })

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Administrative match suggestions',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('status')).toHaveTextContent(
      /administrative match suggestion/i,
    )

    const firstCard = screen.getAllByRole('article')[0]
    expect(firstCard).toBeDefined()
    expect(
      within(firstCard!).getByRole('heading', { level: 2 }),
    ).toBeInTheDocument()
    expect(
      within(firstCard!).getByText('Strong administrative match'),
    ).toBeInTheDocument()
    expect(within(firstCard!).getByText('95 points')).toBeInTheDocument()
    expect(
      within(firstCard!).getByRole('heading', { name: 'Matched criteria' }),
    ).toBeInTheDocument()
    expect(
      within(firstCard!).getByRole('heading', { name: 'Unmatched criteria' }),
    ).toBeInTheDocument()
  })

  it('shows localized English score labels with text bands', () => {
    renderMatches({ intake: sampleIntake })

    expect(
      screen.getAllByText(
        /Strong administrative match|Possible administrative match|Limited administrative match/,
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(/\d+ points/).length).toBeGreaterThan(0)
  })

  it('shows localized Brazilian Portuguese content', async () => {
    await i18n.changeLanguage('pt-BR')
    renderMatches({ intake: sampleIntake })

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sugestões administrativas de correspondência',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(
        /Correspondência administrativa forte|Correspondência administrativa possível|Correspondência administrativa limitada/,
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('heading', { name: 'Critérios atendidos' }).length,
    ).toBeGreaterThan(0)
  })

  it('shows an accessible empty state without intake data', () => {
    renderMatches()

    expect(
      screen.getByRole('heading', { name: 'No intake data for matching' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start intake' }),
    ).toHaveAttribute('href', '/intake')
  })

  it('renders an accessible disclaimer', () => {
    renderMatches({ intake: sampleIntake })

    const disclaimer = screen.getByRole('note')
    expect(disclaimer).toHaveTextContent(/administrative suggestions/i)
    expect(disclaimer).toHaveTextContent(/not diagnoses/i)
    expect(disclaimer).toHaveTextContent(/not clinical recommendations/i)
    expect(disclaimer).toHaveTextContent(/human coordinator/i)
  })

  it('links back to intake from results', () => {
    renderMatches({ intake: sampleIntake })

    expect(
      screen.getByRole('link', { name: 'Start intake' }),
    ).toHaveAttribute('href', '/intake')
  })
})
