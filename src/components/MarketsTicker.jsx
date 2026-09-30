import { useState } from 'react'
import LiveChart from './LiveChart'
import '../styles/marketsTicker.css'

// Markets shown in the chart dropdown (all live from Binance).
const CHART_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'TRXUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'TONUSDT',
  'LINKUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LTCUSDT',
  'SHIBUSDT',
  'NEARUSDT',
  'UNIUSDT'
]

// Where the "Trade" button sends people — same funnel as the
// hero's "Get Started" button.
const TRADE_URL = 'https://wallet.bitxnow.com/register'

function MarketsTicker() {
  const [chartSymbol, setChartSymbol] = useState('BTCUSDT')

  return (
    <section className="markets-section">
      <div className="markets-container">
        <div className="markets-header">
          <div>
            <p className="markets-label">Live Markets</p>
            <h2>Track the Coins That Matter</h2>
          </div>
        </div>

        <LiveChart
          symbol={chartSymbol}
          symbols={CHART_SYMBOLS}
          onSymbolChange={setChartSymbol}
          tradeUrl={TRADE_URL}
        />
      </div>
    </section>
  )
}

export default MarketsTicker