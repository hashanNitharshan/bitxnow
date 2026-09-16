import '../styles/cardSection.css'

function CardSection() {
  return (
    <section className="bx-card-section" aria-labelledby="bx-card-heading">
      <div className="bx-card-inner">
        <div className="bx-card-copy">
          <p className="bx-card-kicker">BitXnow Card</p>
          <h2 id="bx-card-heading">Spend your crypto like it&apos;s already cash.</h2>
          <p className="bx-card-description">
            Load your wallet balance onto a BitXnow Card and pay anywhere
            cards are accepted, in-store or online. No conversions to plan,
            no waiting on transfers, your balance is always ready to spend.
          </p>

          <ul className="bx-card-points">
            <li>Instant conversion at the point of sale</li>
            <li>Freeze or replace a card in seconds from the app</li>
            <li>Choose a virtual card in minutes or order a physical one</li>
          </ul>

          <a
            href="https://wallet.bitxnow.com/card"
            target="_blank"
            rel="noopener noreferrer"
            className="bx-card-cta"
          >
            Get my card
          </a>
        </div>

        <div className="bx-card-stack" aria-hidden="true">
          <div className="bx-card bx-card--white">
            <div className="bx-card-top">
              <span className="bx-card-logo">
                BITXNOW<span className="bx-card-logo-dot"></span>
              </span>
              <span className="bx-card-tier">Signature</span>
            </div>
            <div className="bx-card-chip"></div>
            <div className="bx-card-number">•••• •••• •••• 4471</div>
          </div>

          <div className="bx-card bx-card--gold">
            <div className="bx-card-top">
              <span className="bx-card-logo">
                BITXNOW<span className="bx-card-logo-dot"></span>
              </span>
              <span className="bx-card-tier">Gold</span>
            </div>
            <div className="bx-card-chip"></div>
            <div className="bx-card-number">•••• •••• •••• 8823</div>
          </div>

          <div className="bx-card bx-card--black">
            <div className="bx-card-top">
              <span className="bx-card-logo">
                BITXNOW<span className="bx-card-logo-dot"></span>
              </span>
              <span className="bx-card-tier">Black</span>
            </div>
            <div className="bx-card-chip"></div>
            <div className="bx-card-number">•••• •••• •••• 2049</div>
            <svg
              className="bx-card-wave"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 8.82a6 6 0 0 1 0 8.36"></path>
              <path d="M9 5.64a10 10 0 0 1 0 14.72"></path>
              <path d="M12 2.46a14 14 0 0 1 0 21.08" opacity="0.5"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CardSection