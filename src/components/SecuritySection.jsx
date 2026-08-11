import '../styles/security.css'

const securityPoints = [
  {
    title: 'Admin-Reviewed Transactions',
    description:
      'Every wallet request is checked by an admin before funds move, adding a human review on top of automated rules.'
  },
  {
    title: 'Verified Merchants Only',
    description:
      'Merchants are vetted before they can accept client requests, so you always know who is on the other side of a trade.'
  },
  {
    title: 'Auto-Locking Chat',
    description:
      'Transaction chats lock automatically once a pending request goes inactive, keeping conversations tied to real activity.'
  },
  {
    title: 'Role-Based Access',
    description:
      'Admin, merchant, and client accounts each operate in their own permissioned space, limiting what any single login can see or do.'
  }
]

function SecuritySection() {
  return (
    <section className="security-section">
      <div className="security-container">
        <div className="security-intro">
          <p className="security-label">Built On Trust</p>
          <h2>Security You Can Actually Verify</h2>
          <p className="security-description">
            BITXNOW is built around review and accountability at every step, not just a promise on
            a landing page.
          </p>
        </div>

        <div className="security-grid">
          {securityPoints.map(point => (
            <div className="security-card" key={point.title}>
              <span className="security-icon" aria-hidden="true" />
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SecuritySection