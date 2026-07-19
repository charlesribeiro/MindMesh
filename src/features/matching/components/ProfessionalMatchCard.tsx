import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { formatSessionPrice } from '../../intake/utils/formatIntake'
import type { MatchResult } from '../domain/matchingTypes'
import {
  formatLanguageList,
  formatModalityList,
  formatPeriodList,
  formatTopicList,
} from '../utils/formatCriterionValue'
import { MatchExplanation } from './MatchExplanation'
import { MatchScore } from './MatchScore'

type ProfessionalMatchCardProps = {
  result: MatchResult
  rank: number
}

export function ProfessionalMatchCard({
  result,
  rank,
}: ProfessionalMatchCardProps) {
  const { t, i18n } = useTranslation('matching')
  const headingId = useId()
  const { professional, score, matchedCriteria, unmatchedCriteria } = result

  return (
    <article
      className="match-card"
      aria-labelledby={headingId}
    >
      <header className="match-card__header">
        <p className="match-card__rank">{t('results.rank', { rank })}</p>
        <h2 id={headingId} className="match-card__name">
          {professional.displayName}
        </h2>
        <MatchScore score={score} />
      </header>

      <section
        className="match-card__profile"
        aria-labelledby={`${headingId}-profile`}
      >
        <h3 id={`${headingId}-profile`}>{t('sections.profile')}</h3>
        <dl className="match-card__dl">
          <div>
            <dt>{t('fields.modality')}</dt>
            <dd>{formatModalityList(professional.modalities, t)}</dd>
          </div>
          <div>
            <dt>{t('fields.availability')}</dt>
            <dd>{formatPeriodList(professional.availablePeriods, t)}</dd>
          </div>
          <div>
            <dt>{t('fields.price')}</dt>
            <dd>
              {formatSessionPrice(professional.sessionPrice, i18n.language)}
            </dd>
          </div>
          <div>
            <dt>{t('fields.languages')}</dt>
            <dd>{formatLanguageList(professional.languages, t)}</dd>
          </div>
          <div>
            <dt>{t('fields.topics')}</dt>
            <dd>{formatTopicList(professional.supportTopics, t)}</dd>
          </div>
        </dl>
      </section>

      <MatchExplanation
        matchedCriteria={matchedCriteria}
        unmatchedCriteria={unmatchedCriteria}
        headingIdPrefix={headingId}
      />
    </article>
  )
}
