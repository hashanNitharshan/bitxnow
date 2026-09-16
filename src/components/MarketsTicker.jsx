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

const BYBIT_TICKERS_URL = 'https://api.bybit.com/v5/market/tickers?category=linear'
const FUTURES_LIMIT = 8

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

function formatFuturesPrice(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '--'
  return formatPrice(num)
}

function formatFuturesChange(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '--'
  const pct = num * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function futuresBaseSymbol(symbol) {
  return symbol.endsWith('USDT') ? symbol.slice(0, -4) : symbol
}

function MarketsTicker() {
  const [activeTab, setActiveTab] = useState('popular')
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [dirs, setDirs] = useState({})

  const [futures, setFutures] = useState([])
  const [futuresLoading, setFuturesLoading] = useState(true)
  const [futuresError, setFuturesError] = useState(null)
  const [futuresDirs, setFuturesDirs] = useState({})

  // Holds each row's price from the previous poll so we can flash the row
  // green/red on an actual tick, not just show the static 24h change.
  const prevPricesRef = useRef({})
  const prevFuturesPricesRef = useRef({})

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

  const fetchFutures = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setFuturesLoading(true)

    try {
      const response = await fetch(BYBIT_TICKERS_URL)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const payload = await response.json()
      const list = payload?.result?.list || []

      const usdtPerps = list.filter(item => item.symbol && item.symbol.endsWith('USDT'))
      const sorted = [...usdtPerps].sort(
        (a, b) => Number(b.turnover24h || 0) - Number(a.turnover24h || 0)
      )
      const top = sorted.slice(0, FUTURES_LIMIT)

      const prev = prevFuturesPricesRef.current
      setFuturesDirs(prevDirs => {
        const nextDirs = {}
        top.forEach(item => {
          const oldPrice = prev[item.symbol]
          const newPrice = Number(item.lastPrice)
          if (oldPrice !== undefined && newPrice !== undefined && newPrice !== oldPrice) {
            nextDirs[item.symbol] = newPrice > oldPrice ? 1 : -1
          } else {
            nextDirs[item.symbol] = prevDirs[item.symbol] || 0
          }
        })
        return nextDirs
      })
      top.forEach(item => {
        prev[item.symbol] = Number(item.lastPrice)
      })

      setFutures(top)
      setFuturesError(null)
    } catch (err) {
      setFuturesError('Live futures prices are temporarily unavailable. Showing last known data.')
    } finally {
      if (!silent) setFuturesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoins()
    const interval = setInterval(() => fetchCoins({ silent: true }), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchCoins])

  useEffect(() => {
    fetchFutures()
    const interval = setInterval(() => fetchFutures({ silent: true }), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchFutures])

  const isFuturesTab = activeTab === 'futures'

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
  const showEmptyState = !isFuturesTab && !loading && listToShow.length === 0 && (!error || hasCoins)
  const skeletonRows = activeTab === 'all' ? 8 : 5

  const filteredFutures = q
    ? futures.filter(item => item.symbol.toLowerCase().includes(q))
    : futures
  const hasFutures = futures.length > 0
  const showFuturesEmptyState =
    isFuturesTab && !futuresLoading && filteredFutures.length === 0 && (!futuresError || hasFutures)

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
            <button
              type="button"
              role="tab"
              aria-selected={isFuturesTab}
              className={`markets-tab ${isFuturesTab ? 'active' : ''}`}
              onClick={() => setActiveTab('futures')}
            >
              Hot Futures
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
            placeholder={isFuturesTab ? 'Search by symbol…' : 'Search coin by name or symbol…'}
            autoComplete="off"
          />
        </div>

        <div className={`markets-table ${activeTab === 'all' ? 'markets-table--scroll' : ''}`}>
          <div className="markets-row markets-row-head">
            <span>{isFuturesTab ? 'Market' : 'Coin'}</span>
            <span>Price</span>
            <span>24h Change</span>
            <span className="markets-col-action" aria-hidden="true" />
          </div>

          {!isFuturesTab && loading && (
            <div className="markets-skeleton-wrap">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <div className="markets-skeleton-row" key={index} />
              ))}
            </div>
          )}

          {isFuturesTab && futuresLoading && (
            <div className="markets-skeleton-wrap">
              {Array.from({ length: FUTURES_LIMIT }).map((_, index) => (
                <div className="markets-skeleton-row" key={index} />
              ))}
            </div>
          )}

          {!isFuturesTab && !loading && error && !hasCoins && (
            <div className="markets-state markets-error">
              <p>{error}</p>
              <button type="button" onClick={() => fetchCoins()}>
                Retry
              </button>
            </div>
          )}

          {isFuturesTab && !futuresLoading && futuresError && !hasFutures && (
            <div className="markets-state markets-error">
              <p>{futuresError}</p>
              <button type="button" onClick={() => fetchFutures()}>
                Retry
              </button>
            </div>
          )}

          {!isFuturesTab && !loading && showEmptyState && (
            <div className="markets-state">
              <p>{q ? `No coins match "${query}".` : 'No data to show right now.'}</p>
            </div>
          )}

          {isFuturesTab && !futuresLoading && showFuturesEmptyState && (
            <div className="markets-state">
              <p>{q ? `No markets match "${query}".` : 'No data to show right now.'}</p>
            </div>
          )}

          {!isFuturesTab &&
            !loading &&
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

          {isFuturesTab &&
            !futuresLoading &&
            filteredFutures.length > 0 &&
            filteredFutures.map(item => {
              const changeValue = Number(item.price24hPcnt)
              const isPositive = (Number.isNaN(changeValue) ? 0 : changeValue) >= 0
              const dir = futuresDirs[item.symbol] || 0
              const base = futuresBaseSymbol(item.symbol)

              return (
                <a
                  className="markets-row markets-row-link"
                  key={item.symbol}
                  href={TRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="markets-coin">
                    <span className="markets-coin-badge" aria-hidden="true">
                      {base.slice(0, 4)}
                    </span>
                    <span className="markets-coin-names">
                      <span className="markets-coin-name">{base}</span>
                      <span className="markets-coin-symbol">Perpetual</span>
                    </span>
                  </span>
                  <span
                    className={`markets-price ${
                      dir > 0 ? 'flash-up' : dir < 0 ? 'flash-down' : ''
                    }`}
                  >
                    ${formatFuturesPrice(item.lastPrice)}
                  </span>
                  <span className={`markets-change ${isPositive ? 'positive' : 'negative'}`}>
                    {formatFuturesChange(item.price24hPcnt)}
                  </span>
                  <span className="markets-col-action">
                    <span className="markets-trade-pill">Trade</span>
                  </span>
                </a>
              )
            })}
        </div>

        {!isFuturesTab && error && hasCoins && <p className="markets-inline-warning">{error}</p>}
        {isFuturesTab && futuresError && hasFutures && (
          <p className="markets-inline-warning">{futuresError}</p>
        )}

        <p className="markets-disclaimer">
          {isFuturesTab
            ? 'Futures data from Bybit (USDT perpetuals), refreshed every 60 seconds.'
            : 'Prices from CoinGecko, refreshed every 60 seconds.'}
        </p>
      </div>
    </section>
  )
}

export default MarketsTicker