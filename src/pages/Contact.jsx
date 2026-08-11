import { useState } from 'react'
import '../styles/contact.css'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: ''
}

function Contact() {
  const [formData, setFormData] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData(currentData => ({
      ...currentData,
      [name]: value
    }))

    if (submitted) {
      setSubmitted(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    setSubmitted(true)
    setFormData(initialForm)
  }

  return (
    <section className="contact-page">
      <div className="contact-container">
        <div className="contact-introduction">
          <p className="page-label">
            Contact BITXNOW
          </p>

          <h1>Contact Us</h1>

          <p>
            Have a question or need support? Complete the form and
            send us your message.
          </p>

          <div className="contact-information">
            <div className="contact-info-item">
              <span>Email</span>
              <a href="mailto:support@bitxnow.com">
                support@bitxnow.com
              </a>
            </div>

            <div className="contact-info-item">
              <span>Support</span>
              <p>Available for wallet-related assistance.</p>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="name">
                Your name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Your email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Enter the subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                placeholder="Write your message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">
              Send Message
            </button>
          </form>

          {submitted && (
            <p
              className="success-message"
              role="status"
            >
              Your message was submitted successfully.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Contact