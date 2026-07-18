import { Link } from 'react-router-dom'
import { professionals } from '../fixtures/professionals'

export function CoordinatorPage() {
  return (
    <div className="page">
      <h1>Coordinator dashboard</h1>
      <p className="page__lede">
        Coordinators will review administrative match suggestions and approve or
        override referrals. Approval UI is not implemented yet.
      </p>
      <p className="placeholder-note">
        Demo placeholder — the professionals below are fictional. Suggestions
        are not clinical recommendations.
      </p>

      <h2>Sample professionals</h2>
      <ul>
        {professionals.map((professional) => (
          <li key={professional.id}>
            {professional.displayName}, {professional.credentials} —{' '}
            {professional.locationLabel} ({professional.availability})
          </li>
        ))}
      </ul>

      <div className="page-actions">
        <Link className="btn btn--secondary" to="/intake/review">
          Back to review
        </Link>
        <Link className="btn btn--secondary" to="/">
          Home
        </Link>
      </div>
    </div>
  )
}
