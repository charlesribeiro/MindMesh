import { useTranslation } from 'react-i18next'
import type { MatchCriterion } from '../domain/matchingTypes'
import { formatCriterionValue } from '../utils/formatCriterionValue'

type MatchExplanationProps = {
  matchedCriteria: MatchCriterion[]
  unmatchedCriteria: MatchCriterion[]
  headingIdPrefix: string
}

const criterionLabelKeys = {
  modality: 'criteria.modality',
  period: 'criteria.period',
  price: 'criteria.price',
  language: 'criteria.language',
  topic: 'criteria.topic',
  gender: 'criteria.gender',
} as const

export function MatchExplanation({
  matchedCriteria,
  unmatchedCriteria,
  headingIdPrefix,
}: MatchExplanationProps) {
  const { t, i18n } = useTranslation('matching')

  return (
    <div className="match-explanation">
      <section aria-labelledby={`${headingIdPrefix}-matched`}>
        <h4 id={`${headingIdPrefix}-matched`}>{t('sections.matched')}</h4>
        {matchedCriteria.length === 0 ? (
          <p className="match-explanation__empty">{t('sections.matched')}: —</p>
        ) : (
          <ul className="match-explanation__list">
            {matchedCriteria.map((criterion) => (
              <li key={criterion.id}>
                <span className="match-explanation__name">
                  {t(criterionLabelKeys[criterion.id])}
                </span>
                <span className="match-explanation__detail">
                  {formatCriterionValue(criterion, t, i18n.language)}
                </span>
                <span className="match-explanation__points">
                  {t('criteria.pointsAwarded', { points: criterion.points })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${headingIdPrefix}-unmatched`}>
        <h4 id={`${headingIdPrefix}-unmatched`}>{t('sections.unmatched')}</h4>
        {unmatchedCriteria.length === 0 ? (
          <p className="match-explanation__empty">
            {t('sections.unmatched')}: —
          </p>
        ) : (
          <ul className="match-explanation__list">
            {unmatchedCriteria.map((criterion) => (
              <li key={criterion.id}>
                <span className="match-explanation__name">
                  {t(criterionLabelKeys[criterion.id])}
                </span>
                <span className="match-explanation__detail">
                  {formatCriterionValue(criterion, t, i18n.language)}
                </span>
                <span className="match-explanation__points">
                  {t('criteria.pointsAwarded', { points: criterion.points })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
