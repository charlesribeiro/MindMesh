import { Link } from 'react-router-dom'
import './LandingPage.css'

export function LandingPage() {
  return (
    <div className="landing">
      <section className="landing__hero" aria-labelledby="landing-brand">
        <div className="landing__hero-content">
          <h1 id="landing-brand" className="landing__brand">
            MindMesh
          </h1>
          <p className="landing__tagline">
            Administrative intake and thoughtful professional matching—with a
            human coordinator in the loop.
          </p>
          <div className="landing__actions">
            <Link className="btn btn--primary" to="/intake">
              Start intake
            </Link>
            <Link className="btn btn--secondary" to="/coordinator">
              Coordinator view
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
