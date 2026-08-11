import '../styles/footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© 2026 BITXNOW. All rights reserved.</p>

        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="https://wallet.bitxnow.com/login">
            Login
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer