import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { IntakeSubmissionPayload } from '../intake/types/intake'
import type { MatchResult } from './domain/matchingTypes'
import { MatchingResultsPage } from './MatchingResultsPage'
import * as matchProfessionalsModule from './domain/matchProfessionals'

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

const sampleMatches: MatchResult[] = [
  {
    score: 95,
    professional: {
      id: 'pro-maya-chen',
      displayName: 'Maya Chen',
      modalities: ['online', 'in-person'],
      availablePeriods: ['morning', 'afternoon'],
      sessionPrice: 120,
      languages: ['en', 'es'],
      supportTopics: ['anxiety', 'work', 'self-knowledge'],
      gender: 'female',
      active: true,
    },
    matchedCriteria: [
      {
        id: 'modality',
        points: 30,
        matched: true,
        intakeValue: 'online',
        professionalValue: ['online', 'in-person'],
      },
    ],
    unmatchedCriteria: [
      {
        id: 'period',
        points: 0,
        matched: false,
        intakeValue: ['morning', 'evening'],
        professionalValue: ['morning', 'afternoon'],
      },
    ],
  },
]

function renderMatches(state?: {
  intake: IntakeSubmissionPayload
  matches: MatchResult[]
}) {
  return render(
    <MemoryRouter
      initialEntries={[
        state ? { pathname: '/matches', state } : { pathname: '/matches' },
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
  it('renders matches returned by the mutation without calling the engine', () => {
    const spy = vi.spyOn(matchProfessionalsModule, 'matchProfessionals')

    renderMatches({ intake: sampleIntake, matches: sampleMatches })

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Administrative match suggestions',
      }),
    ).toBeInTheDocument()

    const firstCard = screen.getAllByRole('article')[0]
    expect(firstCard).toBeDefined()
    expect(
      within(firstCard!).getByRole('heading', { name: 'Maya Chen' }),
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
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('shows localized English score labels with text bands', () => {
    renderMatches({ intake: sampleIntake, matches: sampleMatches })

    expect(
      screen.getAllByText(
        /Strong administrative match|Possible administrative match|Limited administrative match/,
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(/\d+ points/).length).toBeGreaterThan(0)
  })

  it('shows localized Brazilian Portuguese content', async () => {
    await i18n.changeLanguage('pt-BR')
    renderMatches({ intake: sampleIntake, matches: sampleMatches })

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sugestões administrativas de correspondência',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/Correspondência administrativa forte/).length,
    ).toBeGreaterThan(0)
  })

  it('shows an accessible empty state without mutation result data', () => {
    renderMatches()

    expect(
      screen.getByRole('heading', { name: 'No intake data for matching' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start intake' }),
    ).toHaveAttribute('href', '/intake')
  })

  it('shows empty state when intake is present without matches', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/matches',
            state: { intake: sampleIntake },
          },
        ]}
      >
        <Routes>
          <Route path="/matches" element={<MatchingResultsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'No intake data for matching' }),
    ).toBeInTheDocument()
  })

  it('renders an accessible disclaimer', () => {
    renderMatches({ intake: sampleIntake, matches: sampleMatches })

    const disclaimer = screen.getByRole('note')
    expect(disclaimer).toHaveTextContent(/administrative suggestions/i)
    expect(disclaimer).toHaveTextContent(/not diagnoses/i)
  })

  it('links back to intake from results', () => {
    renderMatches({ intake: sampleIntake, matches: sampleMatches })

    expect(
      screen.getByRole('link', { name: 'Start intake' }),
    ).toHaveAttribute('href', '/intake')
  })
})
