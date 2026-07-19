import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import type { MatchResult } from '../../matching/domain/matchingTypes'
import type { MatchesLocationState } from '../../matching/utils/parseMatchesState'
import type { IntakeSubmissionPayload } from '../types/intake'

type IntakeSuccessProps = {
  intakeId: string
  intake: IntakeSubmissionPayload
  matches: MatchResult[]
  onStartOver: () => void
}

export function IntakeSuccess({
  intakeId,
  intake,
  matches,
  onStartOver,
}: IntakeSuccessProps) {
  const { t } = useTranslation('intake')
  const matchesState: MatchesLocationState = { intake, intakeId, matches }

  return (
    <div className="intake-form intake-form--success" role="status">
      <h2>{t('success.title')}</h2>
      <p>
        <Trans
          i18nKey="success.body"
          ns="intake"
          values={{ id: intakeId }}
          components={{ code: <code /> }}
        />
      </p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/matches" state={matchesState}>
          {t('actions.viewMatches')}
        </Link>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onStartOver}
        >
          {t('actions.startAnother')}
        </button>
      </div>
    </div>
  )
}
