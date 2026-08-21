import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/marketsTicker.css'

const POPULAR_IDS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'tron']

const STABLECOIN_IDS = new Set([
  'tether',
  'usd-coin',
  'dai',
  'binance-usd',
  'true-usd',
  'first-digital-usd',
  'usdd'
])

const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=100&page=1' +
  '&sparkline=false&price_change_percentage=24h'

const REFRESH_INTERVAL_MS = 60000

// Where the "Trade" pill on each row sends people — same funnel as the
// hero's "Get Started" button.
const TRADE_URL = 'https://wallet.bitxnow.com/register'

function formatPrice(value) {
  if (value === null || value === undefined) return '--'
  if (value >= 1) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  })
}

function formatChange(value) {
  if (value === null || value === undefined) return '--'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function MarketsTicker() {
  const [activeTab, setActiveTab] = useState('popular')
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [dirs, setDirs] = useState({})

  // Holds each coin's price from the previous poll so we can flash the row
  // green/red on an actual tick, not just show the static 24h change.
  const prevPricesRef = useRef({})

  const fetchCoins = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()

      const prev = prevPricesRef.current
      setDirs(prevDirs => {
        const nextDirs = {}
        data.forEach(coin => {
          const oldPrice = prev[coin.id]
          const newPrice = coin.current_price
          if (oldPrice !== undefined && newPrice !== undefined && newPrice !== oldPrice) {
            nextDirs[coin.id] = newPrice > oldPrice ? 1 : -1
          } else {
            nextDirs[coin.id] = prevDirs[coin.id] || 0
          }
        })
        return nextDirs
      })
      data.forEach(coin => {
        prev[coin.id] = coin.current_price
      })

      setCoins(data)
      setError(null)
    } catch (err) {
      setError('Live prices are temporarily unavailable. Showing last known data.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoins()
    const interval = setInterval(() => fetchCoins({ silent: true }), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchCoins])

  const popularCoins = POPULAR_IDS.map(id => coins.find(coin => coin.id === id)).filter(Boolean)

  const topGainers = [...coins]
    .filter(coin => !STABLECOIN_IDS.has(coin.id))
    .filter(
      coin =>
        coin.price_change_percentage_24h !== null &&
        coin.price_change_percentage_24h !== undefined
    )
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)

  const q = query.trim().toLowerCase()
  const matchesQuery = coin =>
    !q || coin.name.toLowerCase().includes(q) || coin.symbol.toLowerCase().includes(q)

  const baseList = activeTab === 'popular' ? popularCoins : activeTab === 'gainers' ? topGainers : coins

  const listToShow = q ? baseList.filter(matchesQuery) : baseList
  const hasCoins = coins.length > 0
  const showEmptyState = !loading && listToShow.length === 0 && (!error || hasCoins)
  const skeletonRows = activeTab === 'all' ? 8 : 5

  return (
    <section className="markets-section">
      <div className="markets-container">
        <div className="markets-header">
          <div>
            <p className="markets-label">Live Markets</p>
            <h2>Track the Coins That Matter</h2>
          </div>

          <div className="markets-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'popular'}
              className={`markets-tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'gainers'}
              className={`markets-tab ${activeTab === 'gainers' ? 'active' : ''}`}
              onClick={() => setActiveTab('gainers')}
            >
              Top Gainers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`markets-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Coins
            </button>
          </div>
        </div>

        <div className="markets-search">
          <svg className="markets-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search coin by name or symbol…"
            autoComplete="off"
          />
        </div>

        <div className={`markets-table ${activeTab === 'all' ? 'markets-table--scroll' : ''}`}>
          <div className="markets-row markets-row-head">
            <span>Coin</span>
            <span>Price</span>
            <span>24h Change</span>
            <span className="markets-col-action" aria-hidden="true" />
          </div>

          {loading && (
            <div className="markets-skeleton-wrap">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <div className="markets-skeleton-row" key={index} />
              ))}
            </div>
          )}

          {!loading && error && !hasCoins && (
            <div className="markets-state markets-error">
              <p>{error}</p>
              <button type="button" onClick={() => fetchCoins()}>
                Retry
              </button>
            </div>
          )}

          {!loading && showEmptyState && (
            <div className="markets-state">
              <p>{q ? `No coins match “${query}”.` : 'No data to show right now.'}</p>
            </div>
          )}

          {!loading &&
            listToShow.length > 0 &&
            listToShow.map(coin => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
              const dir = dirs[coin.id] || 0
              return (
                <a
                  className="markets-row markets-row-link"
                  key={coin.id}
                  href={TRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="markets-coin">
                    <img src={coin.image} alt={coin.name} loading="lazy" />
                    <span className="markets-coin-names">
                      <span className="markets-coin-name">{coin.name}</span>
                      <span className="markets-coin-symbol">{coin.symbol?.toUpperCase()}</span>
                    </span>
                  </span>
                  <span
                    className={`markets-price ${
                      dir > 0 ? 'flash-up' : dir < 0 ? 'flash-down' : ''
                    }`}
                  >
                    ${formatPrice(coin.current_price)}
                  </span>
                  <span className={`markets-change ${isPositive ? 'positive' : 'negative'}`}>
                    {formatChange(coin.price_change_percentage_24h)}
                  </span>
                  <span className="markets-col-action">
                    <span className="markets-trade-pill">Trade</span>
                  </span>
                </a>
              )
            })}
        </div>

        {error && hasCoins && <p className="markets-inline-warning">{error}</p>}

        <p className="markets-disclaimer">
          Prices from CoinGecko, refreshed every 60 seconds. For reference only — not financial
          advice.
        </p>
      </div>
    </section>
  )
}

export default MarketsTicker
