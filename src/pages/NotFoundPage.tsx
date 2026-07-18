import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p className="page__lede">
        That route does not exist in this MindMesh demo.
      </p>
      <div className="page-actions">
        <Link className="btn btn--primary" to="/">
          Return home
        </Link>
      </div>
    </div>
  )
}
