import { useTranslation } from 'react-i18next'
import {
  scoreBandFor,
  type MatchScoreBand,
} from '../domain/matchingTypes'

type MatchScoreProps = {
  score: number
}

const bandKeys: Record<MatchScoreBand, string> = {
  strong: 'score.strong',
  possible: 'score.possible',
  limited: 'score.limited',
}

export function MatchScore({ score }: MatchScoreProps) {
  const { t } = useTranslation('matching')
  const band = scoreBandFor(score)

  return (
    <p className={`match-score match-score--${band}`}>
      <span className="match-score__band">{t(bandKeys[band])}</span>
      <span className="match-score__separator" aria-hidden="true">
        ·
      </span>
      <span className="match-score__points">
        {t('score.points', { score })}
      </span>
      <span className="visually-hidden">
        {t('score.label')}: {t(bandKeys[band])}
      </span>
    </p>
  )
}
