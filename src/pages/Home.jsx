import { Link } from 'react-router-dom'

import Hyperspeed from '../components/HyberSpeed/Hyperspeed'
import MarketsTicker from '../components/MarketsTicker'
import SecuritySection from '../components/SecuritySection'
import AppDownloadSection from '../components/AppDownloadSection'
import FAQSection from '../components/FAQSection'

import '../styles/home.css'

const hyperspeedOptions = {
  roadLength: 220,
  roadWidth: 18,
  laneCount: 4,
  speed: 38,
  lightCount: 90,
  yellow: 0xf0b90b,
  white: 0xffffff,
  road: 0x080808,
  background: 0x000000
}

function Home() {
  return (
    <main>
      <section className="home-page">
        <div className="home-animation" aria-hidden="true">
          <Hyperspeed effectOptions={hyperspeedOptions} />
        </div>

        <div className="home-overlay" aria-hidden="true" />

        <div className="hero">
          <div className="hero-content">
            <p className="hero-label">
              Secure Digital Wallet
            </p>

            <h1>
              Manage Your Digital Money with{' '}
              <span>BITXNOW</span>
            </h1>

            <p className="hero-description">
              Send, receive, buy, and sell digital funds using a secure and
              user-friendly wallet platform.
            </p>

            <div className="hero-actions">
              <a
                href="https://wallet.bitxnow.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
              >
                Get Started
              </a>

              <Link
                to="/about"
                className="secondary-button"
              >
                Learn More
              </Link>
            </div>

            <div className="hero-features">
              <div className="hero-feature">
                <span aria-hidden="true" />
                Secure Transactions
              </div>

              <div className="hero-feature">
                <span aria-hidden="true" />
                Fast Transfers
              </div>

              <div className="hero-feature">
                <span aria-hidden="true" />
                Simple Platform
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketsTicker />
      <SecuritySection />
      <AppDownloadSection />
      <FAQSection />
    </main>
  )
}

export default Home