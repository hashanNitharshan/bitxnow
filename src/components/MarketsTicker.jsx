import { useCallback, useEffect, useState } from 'react'
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

  const fetchCoins = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = await response.json()
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

  const listToShow = activeTab === 'popular' ? popularCoins : topGainers
  const hasCoins = coins.length > 0
  const showEmptyState = !loading && listToShow.length === 0 && (!error || hasCoins)

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
          </div>
        </div>

        <div className="markets-table">
          <div className="markets-row markets-row-head">
            <span>Coin</span>
            <span>Price</span>
            <span>24h Change</span>
          </div>

          {loading && (
            <div className="markets-skeleton-wrap">
              {Array.from({ length: 5 }).map((_, index) => (
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
              <p>No data to show right now.</p>
            </div>
          )}

          {!loading &&
            listToShow.length > 0 &&
            listToShow.map(coin => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
              return (
                <div className="markets-row" key={coin.id}>
                  <span className="markets-coin">
                    <img src={coin.image} alt={coin.name} loading="lazy" />
                    <span className="markets-coin-names">
                      <span className="markets-coin-name">{coin.name}</span>
                      <span className="markets-coin-symbol">{coin.symbol?.toUpperCase()}</span>
                    </span>
                  </span>
                  <span className="markets-price">${formatPrice(coin.current_price)}</span>
                  <span className={`markets-change ${isPositive ? 'positive' : 'negative'}`}>
                    {formatChange(coin.price_change_percentage_24h)}
                  </span>
                </div>
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