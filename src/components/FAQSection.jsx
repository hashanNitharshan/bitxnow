import { useId, useState } from 'react'
import '../styles/faq.css'

const faqs = [
  {
    question: 'What is BITXNOW?',
    answer:
      'BITXNOW is a digital wallet platform that lets you send, receive, and exchange funds through a reviewed, role-based system involving clients, merchants, and admins.'
  },
  {
    question: 'How do I create a wallet request?',
    answer:
      'Log in to your account, open the wallet section, and submit a request. A merchant or admin reviews it before the transaction is completed.'
  },
  {
    question: 'Is my transaction reviewed before it completes?',
    answer:
      'Yes. Every request goes through admin review before funds are released, adding a manual check beyond automated processing.'
  },
  {
    question: 'Can I chat with the other party in a transaction?',
    answer:
      'Yes. Once a request is active, you can message the counterparty directly from the transaction detail screen. Chats lock automatically if a pending request goes inactive.'
  },
  {
    question: 'Is BITXNOW available on iOS?',
    answer:
      'The BITXNOW app currently supports Android. iOS support is planned for a future release.'
  }
]

function FAQAccordionItem({
  question,
  answer,
  index,
  isOpen,
  onToggle
}) {
  const uniqueId = useId()

  const triggerId = `faq-trigger-${index}-${uniqueId}`
  const panelId = `faq-panel-${index}-${uniqueId}`

  return (
    <div
      className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <h3 className="faq-item-heading">
        <button
          id={triggerId}
          type="button"
          className="faq-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="faq-question-text">
            {question}
          </span>

          <span
            className="faq-arrow-container"
            aria-hidden="true"
          >
            <svg
              className="faq-arrow"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        className="faq-panel"
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
      >
        <div className="faq-panel-inner">
          <div className="faq-answer">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQSection() {
  // Change 0 to null when you do not want any FAQ open initially.
  const [openIndex, setOpenIndex] = useState(0)

  const handleToggle = index => {
    setOpenIndex(currentIndex =>
      currentIndex === index ? null : index
    )
  }

  return (
    <section
      className="faq-section"
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className="faq-container">
        <div className="faq-heading-wrapper">
          <p className="faq-label">FAQ</p>

          <h2 id="faq-title">
            Frequently Asked Questions
          </h2>

          <p className="faq-description">
            Find answers to common questions about the BITXNOW wallet
            platform.
          </p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, index) => (
            <FAQAccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection