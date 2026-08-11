import '../styles/appDownload.css'

const APP_URL = 'https://drive.google.com/file/d/1PfCBD4NIzrE6NUbBJfPLVXMZCUGsv63u/view?usp=drive_link'

// Free, no-signup QR generator — swap for a bundled npm QR library later if you'd rather
// not depend on a third-party image at build/runtime.
const QR_CODE_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0B0E11&color=F0B90B&data=${encodeURIComponent(
  APP_URL
)}`

function AppDownloadSection() {
  return (
    <section className="app-download-section">
      <div className="app-download-container">
        <div className="app-download-copy">
          <p className="app-download-label">Get The App</p>
          <h2>Trade From Your Phone</h2>
          <p className="app-download-description">
            The BITXNOW app is live for Android. Scan the code or open the link below to install it
            and manage your wallet on the go.
          </p>

          <a
            href={APP_URL}
            target="https://drive.google.com/file/d/1PfCBD4NIzrE6NUbBJfPLVXMZCUGsv63u/view?usp=drive_link"
            rel="noopener noreferrer"
            className="app-download-button"
          >
            Download for Android
          </a>

          <div className="app-download-platforms">
            <span className="platform-chip available">Android — Available now</span>
            <span className="platform-chip">iOS — Coming soon</span>
          </div>
        </div>

        <div className="app-download-qr">
          <img src={QR_CODE_SRC} alt="QR code linking to the BITXNOW wallet app" width="200" height="200" />
          <p>Scan to open on your phone</p>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
