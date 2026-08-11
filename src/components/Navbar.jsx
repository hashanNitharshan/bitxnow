import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Globe2,
  HelpCircle,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react'

import logo from '../assets/bitxnow_logo.jpeg'
import '../styles/navbar.css'

const dropdownMenus = {
  products: [
    {
      label: 'Buy Crypto',
      description: 'Buy digital assets securely',
      href: 'https://wallet.bitxnow.com/login',
      icon: CreditCard,
      external: true,
    },
    {
      label: 'BITXNOW Wallet',
      description: 'Manage your digital wallet',
      href: 'https://wallet.bitxnow.com/login',
      icon: Wallet,
      external: true,
    },
    {
      label: 'Secure Transactions',
      description: 'Protected wallet transactions',
      href: '/about',
      icon: ShieldCheck,
      external: false,
    },
  ],

  company: [
    {
      label: 'About BITXNOW',
      description: 'Learn about our platform',
      href: '/about',
      icon: CircleUserRound,
      external: false,
    },
    {
      label: 'Contact Support',
      description: 'Speak with our support team',
      href: '/contact',
      icon: HelpCircle,
      external: false,
    },
  ],
}

const languages = [
  {
    code: 'EN',
    name: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'TA',
    name: 'Tamil',
    flag: '🇱🇰',
  },
  {
    code: 'SI',
    name: 'Sinhala',
    flag: '🇱🇰',
  },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('EN')

  const location = useLocation()
  const navbarRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    closeAllMenus()
  }, [location.pathname])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 992) {
        setMenuOpen(false)
        setMobileSection(null)
      }
    }

    function handleOutsideClick(event) {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        closeAllMenus()
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeAllMenus()
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openDropdown(dropdownName) {
    clearCloseTimer()
    setActiveDropdown(dropdownName)
    setLanguageOpen(false)
  }

  function scheduleDropdownClose() {
    clearCloseTimer()

    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 180)
  }

  function closeAllMenus() {
    clearCloseTimer()
    setMenuOpen(false)
    setActiveDropdown(null)
    setLanguageOpen(false)
    setMobileSection(null)
  }

  function toggleMobileMenu() {
    setMenuOpen(currentValue => !currentValue)
    setActiveDropdown(null)
    setLanguageOpen(false)
  }

  function toggleDesktopDropdown(dropdownName) {
    clearCloseTimer()

    setActiveDropdown(currentValue =>
      currentValue === dropdownName ? null : dropdownName
    )

    setLanguageOpen(false)
  }

  function toggleMobileSection(sectionName) {
    setMobileSection(currentValue =>
      currentValue === sectionName ? null : sectionName
    )
  }

  function toggleLanguage() {
    clearCloseTimer()

    setLanguageOpen(currentValue => !currentValue)
    setActiveDropdown(null)
  }

  function selectLanguage(languageCode) {
    setSelectedLanguage(languageCode)
    setLanguageOpen(false)
  }

  function handleDropdownKeyDown(event, dropdownName) {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      openDropdown(dropdownName)

      requestAnimationFrame(() => {
        const firstDropdownLink = document.querySelector(
          `[data-dropdown="${dropdownName}"] a`
        )

        firstDropdownLink?.focus()
      })
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()

      if (dropdownName === 'products') {
        openDropdown('company')
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()

      if (dropdownName === 'company') {
        openDropdown('products')
      }
    }

    if (event.key === 'Escape') {
      setActiveDropdown(null)
    }
  }

  function handleDropdownBlur(event) {
    const dropdownWrapper = event.currentTarget

    requestAnimationFrame(() => {
      if (!dropdownWrapper.contains(document.activeElement)) {
        scheduleDropdownClose()
      }
    })
  }

  function renderDropdownItems(items) {
    return items.map(item => {
      const Icon = item.icon

      if (item.external) {
        return (
          <a
            key={item.label}
            href={item.href}
            className="navbar-dropdown-item"
            onClick={closeAllMenus}
          >
            <span className="navbar-dropdown-icon">
              <Icon size={19} />
            </span>

            <span className="navbar-dropdown-content">
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </a>
        )
      }

      return (
        <NavLink
          key={item.label}
          to={item.href}
          className="navbar-dropdown-item"
          onClick={closeAllMenus}
        >
          <span className="navbar-dropdown-icon">
            <Icon size={19} />
          </span>

          <span className="navbar-dropdown-content">
            <strong>{item.label}</strong>
            <small>{item.description}</small>
          </span>
        </NavLink>
      )
    })
  }

  return (
    <header className="navbar" ref={navbarRef}>
      <div className="navbar-container">
        <NavLink
          to="/"
          className="navbar-brand"
          onClick={closeAllMenus}
          aria-label="BITXNOW home"
        >
          <img
            src={logo}
            alt="BITXNOW logo"
            className="navbar-logo-image"
          />

          <div className="navbar-brand-content">
            <span className="navbar-logo-text">BITXNOW</span>
            <span className="navbar-logo-tagline">
              Digital Wallet
            </span>
          </div>
        </NavLink>

        <nav
          className="navbar-desktop-navigation"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-navigation-link ${
                isActive ? 'navbar-link-active' : ''
              }`
            }
            onMouseEnter={() => {
              setActiveDropdown(null)
            }}
          >
            Home
          </NavLink>

          {/* Products dropdown */}
          <div
            className="navbar-dropdown-wrapper"
            onMouseEnter={() => openDropdown('products')}
            onMouseLeave={scheduleDropdownClose}
            onFocus={() => openDropdown('products')}
            onBlur={handleDropdownBlur}
          >
            <button
              type="button"
              className={`navbar-navigation-link navbar-dropdown-trigger ${
                activeDropdown === 'products'
                  ? 'navbar-link-active'
                  : ''
              }`}
              onClick={() => toggleDesktopDropdown('products')}
              onKeyDown={event =>
                handleDropdownKeyDown(event, 'products')
              }
              aria-haspopup="true"
              aria-expanded={activeDropdown === 'products'}
              aria-controls="products-dropdown"
            >
              Products

              <ChevronDown
                size={16}
                className={
                  activeDropdown === 'products'
                    ? 'navbar-chevron-open'
                    : ''
                }
              />
            </button>

            <div
              id="products-dropdown"
              data-dropdown="products"
              className={`navbar-dropdown-menu navbar-products-dropdown ${
                activeDropdown === 'products'
                  ? 'navbar-dropdown-visible'
                  : ''
              }`}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleDropdownClose}
            >
              <div className="navbar-dropdown-heading">
                <span>BITXNOW Products</span>
                <small>Explore our wallet services</small>
              </div>

              <div className="navbar-dropdown-items">
                {renderDropdownItems(dropdownMenus.products)}
              </div>
            </div>
          </div>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `navbar-navigation-link ${
                isActive ? 'navbar-link-active' : ''
              }`
            }
            onMouseEnter={() => {
              setActiveDropdown(null)
            }}
          >
            About Us
          </NavLink>

          {/* Company dropdown */}
          <div
            className="navbar-dropdown-wrapper"
            onMouseEnter={() => openDropdown('company')}
            onMouseLeave={scheduleDropdownClose}
            onFocus={() => openDropdown('company')}
            onBlur={handleDropdownBlur}
          >
            <button
              type="button"
              className={`navbar-navigation-link navbar-dropdown-trigger ${
                activeDropdown === 'company'
                  ? 'navbar-link-active'
                  : ''
              }`}
              onClick={() => toggleDesktopDropdown('company')}
              onKeyDown={event =>
                handleDropdownKeyDown(event, 'company')
              }
              aria-haspopup="true"
              aria-expanded={activeDropdown === 'company'}
              aria-controls="company-dropdown"
            >
              Company

              <ChevronDown
                size={16}
                className={
                  activeDropdown === 'company'
                    ? 'navbar-chevron-open'
                    : ''
                }
              />
            </button>

            <div
              id="company-dropdown"
              data-dropdown="company"
              className={`navbar-dropdown-menu ${
                activeDropdown === 'company'
                  ? 'navbar-dropdown-visible'
                  : ''
              }`}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleDropdownClose}
            >
              <div className="navbar-dropdown-heading">
                <span>Company</span>
                <small>Learn more about BITXNOW</small>
              </div>

              <div className="navbar-dropdown-items">
                {renderDropdownItems(dropdownMenus.company)}
              </div>
            </div>
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `navbar-navigation-link ${
                isActive ? 'navbar-link-active' : ''
              }`
            }
            onMouseEnter={() => {
              setActiveDropdown(null)
            }}
          >
            Contact
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <div className="navbar-language-wrapper">
            <button
              type="button"
              className="navbar-language-button"
              onClick={toggleLanguage}
              aria-label="Select language"
              aria-expanded={languageOpen}
            >
              <Globe2 size={18} />

              <span>{selectedLanguage}</span>

              <ChevronDown
                size={15}
                className={
                  languageOpen ? 'navbar-chevron-open' : ''
                }
              />
            </button>

            {languageOpen && (
              <div className="navbar-language-menu">
                {languages.map(language => (
                  <button
                    type="button"
                    key={language.code}
                    className={`navbar-language-option ${
                      selectedLanguage === language.code
                        ? 'navbar-language-selected'
                        : ''
                    }`}
                    onClick={() =>
                      selectLanguage(language.code)
                    }
                  >
                    <span className="navbar-language-flag">
                      {language.flag}
                    </span>

                    <span>{language.name}</span>

                    <small>{language.code}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="navbar-auth-buttons">
            <a
              href="https://wallet.bitxnow.com/login"
              className="navbar-login-button"
            >
              Login
            </a>

            <a
              href="https://wallet.bitxnow.com/register"
              className="navbar-get-started-button"
            >
              Get Started
            </a>
          </div>

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label={
              menuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          className={`navbar-mobile-menu ${
            menuOpen ? 'navbar-mobile-menu-open' : ''
          }`}
        >
          <div className="navbar-mobile-content">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar-mobile-link ${
                  isActive ? 'navbar-mobile-link-active' : ''
                }`
              }
              onClick={closeAllMenus}
            >
              Home
            </NavLink>

            <div className="navbar-mobile-section">
              <button
                type="button"
                className="navbar-mobile-section-button"
                onClick={() => toggleMobileSection('products')}
                aria-expanded={mobileSection === 'products'}
              >
                <span>Products</span>

                <ChevronDown
                  size={18}
                  className={
                    mobileSection === 'products'
                      ? 'navbar-chevron-open'
                      : ''
                  }
                />
              </button>

              <div
                className={`navbar-mobile-submenu ${
                  mobileSection === 'products'
                    ? 'navbar-mobile-submenu-open'
                    : ''
                }`}
              >
                {renderDropdownItems(dropdownMenus.products)}
              </div>
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `navbar-mobile-link ${
                  isActive ? 'navbar-mobile-link-active' : ''
                }`
              }
              onClick={closeAllMenus}
            >
              About Us
            </NavLink>

            <div className="navbar-mobile-section">
              <button
                type="button"
                className="navbar-mobile-section-button"
                onClick={() => toggleMobileSection('company')}
                aria-expanded={mobileSection === 'company'}
              >
                <span>Company</span>

                <ChevronDown
                  size={18}
                  className={
                    mobileSection === 'company'
                      ? 'navbar-chevron-open'
                      : ''
                  }
                />
              </button>

              <div
                className={`navbar-mobile-submenu ${
                  mobileSection === 'company'
                    ? 'navbar-mobile-submenu-open'
                    : ''
                }`}
              >
                {renderDropdownItems(dropdownMenus.company)}
              </div>
            </div>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `navbar-mobile-link ${
                  isActive ? 'navbar-mobile-link-active' : ''
                }`
              }
              onClick={closeAllMenus}
            >
              Contact Us
            </NavLink>

            <div className="navbar-mobile-language">
              <span className="navbar-mobile-language-title">
                <Globe2 size={17} />
                Language
              </span>

              <div className="navbar-mobile-language-options">
                {languages.map(language => (
                  <button
                    type="button"
                    key={language.code}
                    className={
                      selectedLanguage === language.code
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      selectLanguage(language.code)
                    }
                  >
                    {language.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="navbar-mobile-auth">
              <a
                href="https://wallet.bitxnow.com/login"
                className="navbar-mobile-login"
                onClick={closeAllMenus}
              >
                Login
              </a>

              <a
                href="https://wallet.bitxnow.com/register"
                className="navbar-mobile-get-started"
                onClick={closeAllMenus}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar