import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CrosshairMode
} from 'lightweight-charts'
import useBinanceStream from '../hooks/useBinanceStream'
import '../styles/liveChart.css'

// Market data only endpoint. Falls back to the main API if blocked.
const REST_HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com']

const INTERVALS = ['1s', '1m', '15m', '1h', '4h', '1d', '1w']

const MA_SETTINGS = [
  { period: 7, color: '#F0B90B' },
  { period: 25, color: '#E056FD' },
  { period: 99, color: '#8C7CF0' }
]

const UP = '#0ECB81'
const DOWN = '#F6465D'
const BOOK_ROWS = 12
const TRADE_ROWS = 18

// The chart library shows UTC. Shift every timestamp so the axis shows the
// visitor's own local time (Sri Lanka, India, anywhere).
const TZ_SHIFT = -new Date().getTimezoneOffset() * 60
const toChartTime = ms => Math.floor(ms / 1000) + TZ_SHIFT

function decimalsFor(price) {
  const p = Math.abs(Number(price))
  if (!p) return 2
  if (p >= 1000) return 2
  if (p >= 1) return 4
  if (p >= 0.01) return 5
  return 8
}

function fmt(value, decimals = 2) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '--'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

function fmtCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '--'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(2)
}

function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString('en-GB', { hour12: false })
}

function parseKline(k) {
  // REST array format and WebSocket object format both come through here.
  if (Array.isArray(k)) {
    return {
      time: toChartTime(k[0]),
      open: +k[1],
      high: +k[2],
      low: +k[3],
      close: +k[4],
      volume: +k[5]
    }
  }
  return {
    time: toChartTime(k.t),
    open: +k.o,
    high: +k.h,
    low: +k.l,
    close: +k.c,
    volume: +k.v
  }
}

function movingAverage(candles, period) {
  const out = []
  let sum = 0
  for (let i = 0; i < candles.length; i += 1) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period })
  }
  return out
}

function lastMA(candles, period) {
  if (candles.length < period) return null
  let sum = 0
  for (let i = candles.length - period; i < candles.length; i += 1) sum += candles[i].close
  return sum / period
}

async function fetchKlines(symbol, interval) {
  let lastError = null
  for (const host of REST_HOSTS) {
    try {
      const res = await fetch(
        `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

/* ---------- Small dark dropdown for choosing the coin ---------- */

// Styles live here so this dropdown only needs this one file.
const PICKER_CSS = `
.lc-dd { position: relative; }
.lc-dd-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: none; cursor: pointer; padding: 4px 0;
  color: #ffffff; font-size: 15px; font-weight: 800; font-family: inherit;
}
.lc-dd-caret { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #848e9c; transition: transform 0.15s ease; }
.lc-dd-btn[aria-expanded="true"] .lc-dd-caret { transform: rotate(180deg); }
.lc-dd-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 50;
  width: 180px; background: #1e2329; border: 1px solid #2b3139; border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55); padding: 6px;
}
.lc-dd-search {
  width: 100%; box-sizing: border-box; background: #0b0e11; border: 1px solid #2b3139;
  border-radius: 6px; color: #eaecef; font-size: 11px; padding: 6px 8px; margin-bottom: 4px; outline: none;
  font-family: inherit;
}
.lc-dd-search:focus { border-color: rgba(240, 185, 11, 0.6); }
.lc-dd-list { max-height: 196px; overflow-y: auto; margin: 0; padding: 0; list-style: none; }
.lc-dd-list::-webkit-scrollbar { width: 5px; }
.lc-dd-list::-webkit-scrollbar-thumb { background: rgba(240, 185, 11, 0.3); border-radius: 5px; }
.lc-dd-item {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11.5px; font-weight: 600; color: #b7bdc6; padding: 6px 8px; border-radius: 6px; cursor: pointer;
}
.lc-dd-item span { color: #5e6673; font-weight: 500; font-size: 10.5px; }
.lc-dd-item:hover, .lc-dd-item.is-hover { background: #2b3139; color: #ffffff; }
.lc-dd-item.is-active { color: #f0b90b; }
.lc-dd-empty { font-size: 11px; color: #5e6673; padding: 8px; text-align: center; }
@media (max-width: 480px) { .lc-dd-btn { font-size: 14px; } }
`

function PairPicker({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const q = search.trim().toUpperCase()
  const filtered = q ? options.filter(s => s.replace(/USDT$/, '').includes(q)) : options

  const pick = s => {
    if (onChange) onChange(s)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="lc-dd" ref={wrapRef}>
      <style>{PICKER_CSS}</style>
      <button
        type="button"
        className="lc-dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {value.replace(/USDT$/, '')}/USDT
        <span className="lc-dd-caret" />
      </button>

      {open && (
        <div className="lc-dd-menu">
          <input
            ref={inputRef}
            className="lc-dd-search"
            type="text"
            placeholder="Search coin…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filtered.length) pick(filtered[0])
            }}
          />
          <ul className="lc-dd-list" role="listbox">
            {filtered.map(s => (
              <li
                key={s}
                role="option"
                aria-selected={s === value}
                className={`lc-dd-item ${s === value ? 'is-active' : ''}`}
                onClick={() => pick(s)}
              >
                {s.replace(/USDT$/, '')}
                <span>/USDT</span>
              </li>
            ))}
            {filtered.length === 0 && <li className="lc-dd-empty">No coin found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function LiveChart({ symbol = 'BTCUSDT', symbols = [], onSymbolChange, tradeUrl }) {
  const [interval, setIntervalValue] = useState('1s')
  const [stats, setStats] = useState(null)
  const [book, setBook] = useState({ bids: [], asks: [] })
  const [trades, setTrades] = useState([])
  const [maValues, setMaValues] = useState({})
  const [hover, setHover] = useState(null)
  const [historyError, setHistoryError] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [mobilePanel, setMobilePanel] = useState('book')

  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)
  const maSeriesRef = useRef([])
  const candlesRef = useRef([])
  const readyRef = useRef(false)

  // Order book and trades arrive many times per second. Keep them in refs and
  // push to React state on a timer so the page stays smooth on phones.
  const pendingBookRef = useRef(null)
  const pendingTradesRef = useRef([])
  const lastPriceRef = useRef(null)
  const [priceDir, setPriceDir] = useState(0)

  const base = symbol.replace(/USDT$/, '')
  const decimals = decimalsFor(stats?.lastPrice ?? candlesRef.current.at(-1)?.close)

  /* ---------- Create chart once ---------- */
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      autoSize: true,
      // Fixed locale so the chart never breaks on unusual browser language settings.
      localization: { locale: 'en-US' },
      layout: {
        background: { color: '#0B0E11' },
        textColor: '#848E9C',
        fontSize: 10,
        attributionLogo: false
      },
      grid: {
        vertLines: { color: 'rgba(43, 49, 57, 0.5)' },
        horzLines: { color: 'rgba(43, 49, 57, 0.5)' }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#5E6673', labelBackgroundColor: '#2B3139' },
        horzLine: { color: '#5E6673', labelBackgroundColor: '#2B3139' }
      },
      rightPriceScale: { borderColor: '#2B3139' },
      timeScale: {
        borderColor: '#2B3139',
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 6
      }
    })

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineColor: '#F0B90B'
    })
    candles.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.26 } })

    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
      priceLineVisible: false
    })
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

    maSeriesRef.current = MA_SETTINGS.map(ma =>
      chart.addSeries(LineSeries, {
        color: ma.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false
      })
    )

    chart.subscribeCrosshairMove(param => {
      const bar = param?.seriesData?.get(candles)
      setHover(bar && param.time ? bar : null)
    })

    chartRef.current = chart
    candleSeriesRef.current = candles
    volumeSeriesRef.current = volume

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [])

  /* ---------- Price precision follows the coin ---------- */
  useEffect(() => {
    if (!candleSeriesRef.current) return
    // Price axis with thousands separators, like Binance (83,150.00).
    chartRef.current?.applyOptions({
      localization: { locale: 'en-US', priceFormatter: p => fmt(p, decimals) }
    })
    candleSeriesRef.current.applyOptions({
      priceFormat: { type: 'price', precision: decimals, minMove: 1 / 10 ** decimals }
    })
    maSeriesRef.current.forEach(s =>
      s.applyOptions({
        priceFormat: { type: 'price', precision: decimals, minMove: 1 / 10 ** decimals }
      })
    )
  }, [decimals])

  /* ---------- Load history when symbol or interval changes ---------- */
  useEffect(() => {
    let cancelled = false
    readyRef.current = false
    setHistoryLoading(true)
    setHistoryError(null)
    setBook({ bids: [], asks: [] })
    setTrades([])
    setStats(null)
    pendingTradesRef.current = []
    pendingBookRef.current = null
    lastPriceRef.current = null

    chartRef.current?.applyOptions({
      timeScale: { secondsVisible: interval === '1s' || interval === '1m' }
    })

    fetchKlines(symbol, interval)
      .then(raw => {
        if (cancelled) return
        const candles = raw.map(parseKline)
        candlesRef.current = candles
        candleSeriesRef.current.setData(
          candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }))
        )
        volumeSeriesRef.current.setData(
          candles.map(c => ({
            time: c.time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(14, 203, 129, 0.45)' : 'rgba(246, 70, 93, 0.45)'
          }))
        )
        MA_SETTINGS.forEach((ma, i) => {
          maSeriesRef.current[i].setData(movingAverage(candles, ma.period))
        })
        updateMaLegend(candles)
        chartRef.current.timeScale().setVisibleLogicalRange({
          from: Math.max(0, candles.length - 120),
          to: candles.length + 6
        })
        readyRef.current = true
      })
      .catch(() => {
        if (!cancelled) setHistoryError('Could not load chart history. Live updates will continue.')
        readyRef.current = true
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [symbol, interval])

  function updateMaLegend(candles) {
    const next = {}
    MA_SETTINGS.forEach(ma => {
      next[ma.period] = lastMA(candles, ma.period)
    })
    setMaValues(next)
  }

  /* ---------- Push buffered book and trades to the screen ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      if (pendingBookRef.current) {
        setBook(pendingBookRef.current)
        pendingBookRef.current = null
      }
      if (pendingTradesRef.current.length) {
        const fresh = pendingTradesRef.current
        pendingTradesRef.current = []
        setTrades(prev => [...fresh, ...prev].slice(0, TRADE_ROWS))
      }
    }, 250)
    return () => clearInterval(timer)
  }, [])

  /* ---------- Live WebSocket ---------- */
  const lower = symbol.toLowerCase()
  const streams = useMemo(
    () => [
      `${lower}@kline_${interval}`,
      `${lower}@depth20@100ms`,
      `${lower}@aggTrade`,
      `${lower}@ticker`
    ],
    [lower, interval]
  )

  const handleMessage = useCallback(
    (stream, data) => {
      if (stream.endsWith(`@kline_${interval}`)) {
        if (!readyRef.current || !data.k) return
        const c = parseKline(data.k)
        const list = candlesRef.current
        const last = list[list.length - 1]
        if (last && c.time < last.time) return
        if (last && last.time === c.time) list[list.length - 1] = c
        else list.push(c)
        if (list.length > 1500) list.splice(0, list.length - 1500)

        candleSeriesRef.current.update({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        })
        volumeSeriesRef.current.update({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(14, 203, 129, 0.45)' : 'rgba(246, 70, 93, 0.45)'
        })
        MA_SETTINGS.forEach((ma, i) => {
          const v = lastMA(list, ma.period)
          if (v !== null) maSeriesRef.current[i].update({ time: c.time, value: v })
        })
        updateMaLegend(list)
        return
      }

      if (stream.includes('@depth')) {
        pendingBookRef.current = {
          bids: (data.bids || []).slice(0, BOOK_ROWS),
          asks: (data.asks || []).slice(0, BOOK_ROWS)
        }
        return
      }

      if (stream.endsWith('@aggTrade')) {
        pendingTradesRef.current.unshift({
          id: data.a,
          price: data.p,
          qty: data.q,
          time: data.T,
          // m = true means the buyer was the maker, so the taker sold.
          side: data.m ? 'sell' : 'buy'
        })
        if (pendingTradesRef.current.length > TRADE_ROWS) {
          pendingTradesRef.current.length = TRADE_ROWS
        }
        return
      }

      if (stream.endsWith('@ticker')) {
        const price = Number(data.c)
        if (lastPriceRef.current !== null && price !== lastPriceRef.current) {
          setPriceDir(price > lastPriceRef.current ? 1 : -1)
        }
        lastPriceRef.current = price
        setStats({
          lastPrice: data.c,
          change: data.p,
          changePct: data.P,
          high: data.h,
          low: data.l,
          volBase: data.v,
          volQuote: data.q
        })
      }
    },
    [interval]
  )

  const status = useBinanceStream(streams, handleMessage)

  /* ---------- Derived values for the UI ---------- */
  const isUp = Number(stats?.changePct ?? 0) >= 0
  const maxBookQty = useMemo(() => {
    const all = [...book.bids, ...book.asks].map(([, q]) => Number(q))
    return all.length ? Math.max(...all) : 1
  }, [book])

  const bookDecimals = decimals
  const qtyDecimals = Number(stats?.lastPrice) >= 100 ? 5 : 2
  const legendBar = hover || candlesRef.current.at(-1)

  const statusLabel =
    status === 'live' ? 'Live' : status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'

  return (
    <div className="lc">
      {/* ---------- Top bar ---------- */}
      <div className="lc-top">
        <div className="lc-pair">
          {symbols.length > 0 ? (
            <PairPicker value={symbol} options={symbols} onChange={onSymbolChange} />
          ) : (
            <span className="lc-pair-name">{base}/USDT</span>
          )}
          <div className="lc-price-block">
            <span
              className={`lc-last ${priceDir > 0 ? 'up' : priceDir < 0 ? 'down' : isUp ? 'up' : 'down'}`}
            >
              {stats ? fmt(stats.lastPrice, decimals) : '--'}
            </span>
            <span className="lc-last-usd">${stats ? fmt(stats.lastPrice, decimals) : '--'}</span>
          </div>
        </div>

        <div className="lc-stats">
          <div className="lc-stat">
            <span className="lc-stat-label">24h Change</span>
            <span className={`lc-stat-value ${isUp ? 'up' : 'down'}`}>
              {stats
                ? `${fmt(stats.change, decimals)} ${isUp ? '+' : ''}${fmt(stats.changePct, 2)}%`
                : '--'}
            </span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">24h High</span>
            <span className="lc-stat-value">{stats ? fmt(stats.high, decimals) : '--'}</span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">24h Low</span>
            <span className="lc-stat-value">{stats ? fmt(stats.low, decimals) : '--'}</span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">24h Vol({base})</span>
            <span className="lc-stat-value">{stats ? fmtCompact(stats.volBase) : '--'}</span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">24h Vol(USDT)</span>
            <span className="lc-stat-value">{stats ? fmtCompact(stats.volQuote) : '--'}</span>
          </div>
        </div>

        <span className={`lc-status lc-status--${status}`}>
          <span className="lc-status-dot" />
          {statusLabel}
        </span>
      </div>

      {/* ---------- Body: book | chart | trades ---------- */}
      <div className="lc-body">
        <div className={`lc-panel lc-book ${mobilePanel === 'book' ? 'is-active' : ''}`}>
          <div className="lc-panel-title">Order Book</div>
          <div className="lc-book-head">
            <span>Price(USDT)</span>
            <span>Amount({base})</span>
            <span>Total</span>
          </div>

          <div className="lc-book-side lc-book-asks">
            {[...book.asks].reverse().map(([price, qty]) => (
              <div className="lc-book-row" key={`a${price}`}>
                <span
                  className="lc-book-bar ask"
                  style={{ width: `${(Number(qty) / maxBookQty) * 100}%` }}
                />
                <span className="down">{fmt(price, bookDecimals)}</span>
                <span>{fmt(qty, qtyDecimals)}</span>
                <span>{fmtCompact(Number(price) * Number(qty))}</span>
              </div>
            ))}
          </div>

          <div className={`lc-book-mid ${isUp ? 'up' : 'down'}`}>
            {stats ? fmt(stats.lastPrice, decimals) : '--'}
            <span className="lc-book-mid-arrow">{priceDir < 0 ? '↓' : '↑'}</span>
            <span className="lc-book-mid-usd">${stats ? fmt(stats.lastPrice, decimals) : '--'}</span>
          </div>

          <div className="lc-book-side lc-book-bids">
            {book.bids.map(([price, qty]) => (
              <div className="lc-book-row" key={`b${price}`}>
                <span
                  className="lc-book-bar bid"
                  style={{ width: `${(Number(qty) / maxBookQty) * 100}%` }}
                />
                <span className="up">{fmt(price, bookDecimals)}</span>
                <span>{fmt(qty, qtyDecimals)}</span>
                <span>{fmtCompact(Number(price) * Number(qty))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lc-chart-wrap">
          <div className="lc-toolbar">
            <span className="lc-toolbar-label">Time</span>
            {INTERVALS.map(iv => (
              <button
                key={iv}
                type="button"
                className={`lc-iv ${interval === iv ? 'active' : ''}`}
                onClick={() => setIntervalValue(iv)}
              >
                {iv}
              </button>
            ))}
          </div>

          <div className="lc-legend">
            {legendBar && (
              <span className="lc-legend-ohlc">
                O <b className={legendBar.close >= legendBar.open ? 'up' : 'down'}>{fmt(legendBar.open, decimals)}</b>
                H <b className={legendBar.close >= legendBar.open ? 'up' : 'down'}>{fmt(legendBar.high, decimals)}</b>
                L <b className={legendBar.close >= legendBar.open ? 'up' : 'down'}>{fmt(legendBar.low, decimals)}</b>
                C <b className={legendBar.close >= legendBar.open ? 'up' : 'down'}>{fmt(legendBar.close, decimals)}</b>
              </span>
            )}
            <span className="lc-legend-ma">
              {MA_SETTINGS.map(ma => (
                <span key={ma.period} style={{ color: ma.color }}>
                  MA({ma.period}) {maValues[ma.period] ? fmt(maValues[ma.period], decimals) : '--'}
                </span>
              ))}
            </span>
          </div>

          <div className="lc-chart" ref={containerRef}>
            {historyLoading && <div className="lc-chart-loading">Loading chart…</div>}
          </div>
          {historyError && <p className="lc-chart-error">{historyError}</p>}
        </div>

          {/* ---------- Mobile switcher (book / trades) ---------- */}
          <div className="lc-mobile-tabs">
            <button
              type="button"
              className={mobilePanel === 'book' ? 'active' : ''}
              onClick={() => setMobilePanel('book')}
            >
              Order Book
            </button>
            <button
              type="button"
              className={mobilePanel === 'trades' ? 'active' : ''}
              onClick={() => setMobilePanel('trades')}
            >
              Market Trades
            </button>
          </div>

        <div className={`lc-panel lc-trades ${mobilePanel === 'trades' ? 'is-active' : ''}`}>
          <div className="lc-panel-title">Market Trades</div>
          <div className="lc-book-head">
            <span>Price(USDT)</span>
            <span>Amount({base})</span>
            <span>Time</span>
          </div>
          <div className="lc-trades-list">
            {trades.map(t => (
              <div className="lc-trade-row" key={t.id}>
                <span className={t.side === 'buy' ? 'up' : 'down'}>{fmt(t.price, decimals)}</span>
                <span>{fmt(t.qty, qtyDecimals)}</span>
                <span className="lc-muted">{fmtTime(t.time)}</span>
              </div>
            ))}
            {trades.length === 0 && <div className="lc-empty">Waiting for trades…</div>}
          </div>
        </div>
      </div>

      <div className="lc-footer">
        <span>Market data from Binance, updated live.</span>
        {tradeUrl && (
          <a className="lc-trade-btn" href={tradeUrl} target="_blank" rel="noopener noreferrer">
            Trade {base} on BitXnow
          </a>
        )}
      </div>
    </div>
  )
}

export default LiveChart