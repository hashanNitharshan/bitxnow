import { useEffect, useRef, useState } from 'react'

// Binance public market data. No API key is needed.
// data-stream.binance.vision only carries market data and is the most widely
// reachable endpoint. stream.binance.com is the fallback.
const WS_HOSTS = [
  'wss://data-stream.binance.vision/stream?streams=',
  'wss://stream.binance.com:9443/stream?streams='
]

/**
 * Opens one combined Binance WebSocket for the given stream names and calls
 * onMessage(streamName, data) for every event.
 *
 * Reconnects automatically (Binance closes every connection after 24 hours,
 * and mobile networks drop often). Pass an empty array to stay disconnected.
 *
 * Returns the connection status: 'idle' | 'connecting' | 'live' | 'reconnecting'
 */
export default function useBinanceStream(streams, onMessage) {
  const [status, setStatus] = useState('idle')
  const handlerRef = useRef(onMessage)
  handlerRef.current = onMessage

  // Join into a string so the effect only reruns when the list really changes.
  const key = (streams || []).filter(Boolean).join('/')

  useEffect(() => {
    if (!key) {
      setStatus('idle')
      return undefined
    }

    let ws = null
    let closedByUs = false
    let retry = 0
    let hostIndex = 0
    let timer = null

    const connect = () => {
      setStatus(retry === 0 ? 'connecting' : 'reconnecting')
      ws = new WebSocket(WS_HOSTS[hostIndex] + key)

      ws.onopen = () => {
        retry = 0
        setStatus('live')
      }

      ws.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg && msg.stream && msg.data) {
            handlerRef.current(msg.stream, msg.data)
          }
        } catch {
          // ignore bad frames
        }
      }

      ws.onclose = () => {
        if (closedByUs) return
        retry += 1
        // After two failures on one host, try the other host.
        if (retry % 2 === 0) hostIndex = (hostIndex + 1) % WS_HOSTS.length
        const delay = Math.min(1000 * 2 ** Math.min(retry, 5), 30000)
        setStatus('reconnecting')
        timer = setTimeout(connect, delay)
      }

      ws.onerror = () => {
        // onclose runs after this and handles the reconnect.
      }
    }

    // Reconnect quickly when the tab comes back after sleep.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && ws && ws.readyState > 1) {
        clearTimeout(timer)
        retry = 0
        connect()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    connect()

    return () => {
      closedByUs = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      if (ws) ws.close()
    }
  }, [key])

  return status
}