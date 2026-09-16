import { Link } from 'react-router-dom'
import '../styles/footer.css'

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 5l14 14"></path>
      <path d="M19 5L5 19"></path>
    </svg>
  )
}

function IconTelegram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4L3 11.5l6 2.2M21 4l-3.2 16L9.2 13.7M21 4L9.2 13.7m0 0l-.6 5.6 3.1-3.2"></path>
    </svg>
  )
}

function IconDiscord() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5.5c-2.4.6-3.7 1.7-3.7 1.7-1.6 3.2-2 6.6-1.8 10 0 0 1.5 1.4 4 1.8l.7-1.4"></path>
      <path d="M16 5.5c2.4.6 3.7 1.7 3.7 1.7 1.6 3.2 2 6.6 1.8 10 0 0-1.5 1.4-4 1.8l-.7-1.4"></path>
      <path d="M8.2 15.2c3.2 1 4.4 1 7.6 0"></path>
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"></circle>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"></circle>
    </svg>
  )
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="3"></rect>
      <path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none"></path>
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3"></rect>
      <path d="M8 10.5v6M8 7.8v.01"></path>
      <path d="M12 16.5v-3.6c0-1.2.9-1.9 2-1.9s2 .7 2 1.9v3.6"></path>
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect>
      <circle cx="12" cy="12" r="3.5"></circle>
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none"></circle>
    </svg>
  )
}

const socialLinks = [
  { name: 'X', href: 'https://x.com/bitxnow', Icon: IconX },
  { name: 'Telegram', href: 'https://t.me/bitxnow', Icon: IconTelegram },
  { name: 'Discord', href: 'https://discord.gg/bitxnow', Icon: IconDiscord },
  { name: 'Instagram', href: 'https://instagram.com/bitxnow', Icon: IconInstagram },
  { name: 'YouTube', href: 'https://youtube.com/@bitxnow', Icon: IconYouTube },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/bitxnow', Icon: IconLinkedIn }
]

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', to: '/contact' }
    ]
  },
  {
    title: 'Products',
    links: [
      { label: 'Wallet', href: 'https://wallet.bitxnow.com' },
      { label: 'P2P Trading', href: 'https://wallet.bitxnow.com/p2p' },
      { label: 'BitXnow Card', href: 'https://wallet.bitxnow.com/card' },
      { label: 'Merchant Tools', href: '#' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Submit a Request', href: '#' },
      { label: 'API Docs', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
      { label: 'AML Policy', href: '#' }
    ]
  }
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bx-footer">
      <div className="bx-footer-top">
        <div className="bx-footer-brand">
          <Link to="/" className="bx-footer-logo">
            BITXNOW<span className="bx-footer-logo-dot"></span>
          </Link>

          <p className="bx-footer-tagline">
            A secure wallet for sending, receiving, and spending digital
            funds, built for people who want their crypto to move as fast
            as they do.
          </p>

          <div className="bx-footer-social">
            {socialLinks.map(function (item) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="bx-footer-social-link"
                >
                  <item.Icon />
                </a>
              )
            })}
          </div>
        </div>

        {footerColumns.map(function (column) {
          return (
            <nav className="bx-footer-column" aria-label={column.title} key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map(function (link) {
                  return (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to}>{link.label}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
          )
        })}
      </div>

      <div className="bx-footer-bottom">
        <p>© {year} BitXnow. All rights reserved.</p>
        <p className="bx-footer-disclaimer">
          Digital assets carry risk. Review our risk disclosure before
          trading or holding funds on BitXnow.
        </p>
      </div>
    </footer>
  )
}

export default Footer