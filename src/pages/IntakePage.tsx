import { Link } from 'react-router-dom'

export function IntakePage() {
  return (
    <div className="page">
      <h1>Administrative intake</h1>
      <p className="page__lede">
        This step will collect contact details and goals for matching. The form
        is not implemented yet.
      </p>
      <p className="placeholder-note">
        Demo placeholder — all data in MindMesh is fictional. MindMesh does not
        diagnose and does not provide clinical recommendations.
      </p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/intake/review">
          Continue to review
        </Link>
        <Link className="btn btn--secondary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}
