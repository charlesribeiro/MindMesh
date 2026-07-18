import { Link } from 'react-router-dom'

export function IntakeReviewPage() {
  return (
    <div className="page">
      <h1>Review intake</h1>
      <p className="page__lede">
        Clients will review and correct structured information extracted from
        free text before submission. This screen is a placeholder.
      </p>
      <p className="placeholder-note">
        Demo placeholder — extracted information must always remain editable.
        Matching results are administrative suggestions only.
      </p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/coordinator">
          Continue to coordinator
        </Link>
        <Link className="btn btn--secondary" to="/intake">
          Back to intake
        </Link>
      </div>
    </div>
  )
}
