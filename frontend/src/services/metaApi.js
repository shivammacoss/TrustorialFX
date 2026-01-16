// MetaAPI Service for real-time MT5 data streaming
import { API_URL } from '../config/api'
// Credentials from .env file (VITE_ prefix for Vite)
const META_API_TOKEN = import.meta.env.VITE_META_API_TOKEN || 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiYmRlZGVjYWJjMDAzOTczNTQ3ODk2Y2NlYjgyNzY2NSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjJkNjM4M2E1LWJiNjgtNGJhOS1hNDBmLTE4OTA5NGQ3YzE0ZiJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MmQ2MzgzYTUtYmI2OC00YmE5LWE0MGYtMTg5MDk0ZDdjMTRmIl19LHsiaWQiOiJtZXRhYXBpLXJwYy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDoyZDYzODNhNS1iYjY4LTRiYTktYTQwZi0xODkwOTRkN2MxNGYiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDoyZDYzODNhNS1iYjY4LTRiYTktYTQwZi0xODkwOTRkN2MxNGYiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MmQ2MzgzYTUtYmI2OC00YmE5LWE0MGYtMTg5MDk0ZDdjMTRmIl19XSwiaWdub3JlUmF0ZUxpbWl0cyI6ZmFsc2UsInRva2VuSWQiOiIyMDIxMDIxMyIsImltcGVyc29uYXRlZCI6ZmFsc2UsInJlYWxVc2VySWQiOiJiYmRlZGVjYWJjMDAzOTczNTQ3ODk2Y2NlYjgyNzY2NSIsImlhdCI6MTc2Nzg2OTUyMywiZXhwIjoxNzc1NjQ1NTIzfQ.OKKP9THiaQN1GRbWEM2HaCRYkNeEyIwB63Jocxyuy-8jR0Gv2fQFncUnWAoVF7jBZRT3Eii4-HqcU7aXZGJZyFyRyekAROD4XEoWfvEDRHGuyi3Mzqt3II3apH-wlFIQDBaH4qtiCCHXPTw1-dDOSDrjcXzVhvx-1sU88Iq_0QBgz7MUJ7zKFWWzB3usBtbixcRHG6fhKFwLlKePry8BMbj9xrvySuyySj0wnl8Qw4Fgo9KYLc4UdliEhNAqN3MPumH4yccM-BZjrYWN_FMLZHCSfutjSSwjoQrwwOTyf8NsHnqJNXfcboV7IZkP5iGth6-hEMNb-UKmdsFZLQjenEI-Ql3xwo-i7luILfqErquc9ZIuhTZVLlAQPiyiiXDCwL6DlJRj625tiAJKgAKz65Bz8NiXZ0T37r9OCKcwK6Q7Rr8LK1bluHGBk3iewpJgpNzPa92GmjBhrbY5EaNfr8Os84zdLOGpww8nljfEqdy40boOl-2hZ8S9FpV6drnlSLD-aAhKbq3yIR9_S_tXqwstIl00_1JUKHpJHZn04zvIXtqYFGgiAxcY7AXKrk1Bty_xulnaiQ9dXuSj8boJJkeoaq6wwJGNe_aA-ytdQAKz6PSxtXRcQVB-PsKzhC8wKCBbxru9zCwDkSXJUPtEKN5c25eMvsTq5JNc5sgbrds'
const META_API_ACCOUNT_ID = import.meta.env.VITE_META_API_ACCOUNT_ID || '5fa758ec-b241-4c97-81c4-9de3a3bc1f04'

console.log('MetaAPI initialized with account:', META_API_ACCOUNT_ID)

class MetaApiService {
  constructor() {
    this.ws = null
    this.subscribers = new Map()
    this.prices = new Map()
    this.symbols = []
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  async getSymbols() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(
        `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${META_API_ACCOUNT_ID}/symbols`,
        {
          headers: {
            'auth-token': META_API_TOKEN,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      )
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error('Failed to fetch symbols')
      const symbols = await response.json()
      this.symbols = symbols
      return symbols
    } catch (error) {
      console.error('Error fetching symbols:', error)
      return []
    }
  }

  async getSymbolSpecification(symbol) {
    try {
      const response = await fetch(
        `https://mt-client-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${META_API_ACCOUNT_ID}/symbols/${symbol}/specification`,
        {
          headers: {
            'auth-token': META_API_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch symbol specification')
      return await response.json()
    } catch (error) {
      console.error('Error fetching symbol specification:', error)
      return null
    }
  }

  async getSymbolPrice(symbol) {
    try {
      // Use backend proxy to avoid CORS issues
      const response = await fetch(`${API_URL}/prices/${symbol}`)
      
      if (!response.ok) throw new Error('Failed to fetch symbol price')
      const data = await response.json()
      if (data.success && data.price) {
        this.prices.set(symbol, data.price)
        return data.price
      }
      return null
    } catch (error) {
      console.error('Error fetching symbol price:', error)
      return null
    }
  }

  async getAllPrices(symbolList) {
    try {
      // Use backend batch endpoint to get all prices at once
      const response = await fetch(`${API_URL}/prices/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: symbolList })
      })
      
      if (!response.ok) throw new Error('Failed to fetch prices')
      const data = await response.json()
      
      if (data.success && data.prices) {
        Object.entries(data.prices).forEach(([symbol, price]) => {
          this.prices.set(symbol, price)
        })
        return data.prices
      }
      return {}
    } catch (error) {
      console.error('Error fetching all prices:', error)
      return {}
    }
  }

  connect(symbolsToSubscribe = []) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = `wss://mt-client-api-v1.new-york.agiliumtrade.ai/ws`
    
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('MetaAPI WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Authenticate
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        accountId: META_API_ACCOUNT_ID,
        token: META_API_TOKEN
      }))

      // Subscribe to symbols
      if (symbolsToSubscribe.length > 0) {
        this.subscribeToSymbols(symbolsToSubscribe)
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('MetaAPI WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('MetaAPI WebSocket disconnected')
      this.isConnected = false
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => {
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
          this.connect(Array.from(this.subscribers.keys()))
        }, 3000 * this.reconnectAttempts)
      }
    }
  }

  handleMessage(data) {
    if (data.type === 'prices' || data.type === 'price') {
      const symbol = data.symbol
      const priceData = {
        bid: data.bid,
        ask: data.ask,
        spread: data.ask - data.bid,
        time: data.time
      }
      
      this.prices.set(symbol, priceData)
      
      // Notify subscribers
      const callback = this.subscribers.get(symbol)
      if (callback) {
        callback(priceData)
      }
    }
  }

  subscribeToSymbols(symbols) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected')
      return
    }

    this.ws.send(JSON.stringify({
      type: 'subscribeToMarketData',
      accountId: META_API_ACCOUNT_ID,
      symbols: symbols,
      subscriptions: [{ type: 'quotes' }]
    }))
  }

  subscribe(symbol, callback) {
    this.subscribers.set(symbol, callback)
    
    if (this.isConnected) {
      this.subscribeToSymbols([symbol])
    }
  }

  unsubscribe(symbol) {
    this.subscribers.delete(symbol)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
    this.isConnected = false
  }

  getPrice(symbol) {
    return this.prices.get(symbol)
  }
}

// Singleton instance
const metaApiService = new MetaApiService()

export default metaApiService
export { META_API_TOKEN, META_API_ACCOUNT_ID }
