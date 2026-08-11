import '../styles/about.css'

function About() {
  return (
    <section className="about-page">
      <div className="about-container">
        <p className="page-label">
          About Our Platform
        </p>

        <h1>About BITXNOW</h1>

        <p className="about-introduction">
          BITXNOW is a modern digital wallet platform designed to
          make online transactions simple, secure, and convenient.
        </p>

        <div className="about-grid">
          <article className="about-card">
            <span className="about-number">01</span>

            <h2>Our Mission</h2>

            <p>
              Our mission is to provide users with a reliable wallet
              platform for managing digital transactions safely and
              efficiently.
            </p>
          </article>

          <article className="about-card">
            <span className="about-number">02</span>

            <h2>Our Vision</h2>

            <p>
              Our vision is to build a trusted digital payment
              ecosystem that is accessible to users everywhere.
            </p>
          </article>

          <article className="about-card">
            <span className="about-number">03</span>

            <h2>Secure Platform</h2>

            <p>
              BITXNOW focuses on providing a simple and secure
              experience for sending, receiving, buying, and selling
              digital funds.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default About