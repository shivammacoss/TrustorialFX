import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

const router = express.Router()

// MetaAPI credentials - loaded from .env file
const META_API_TOKEN = process.env.META_API_TOKEN
const META_API_ACCOUNT_ID = process.env.META_API_ACCOUNT_ID

// Binance symbol mapping for crypto
const BINANCE_SYMBOLS = {
  'BTCUSD': 'BTCUSDT',
  'ETHUSD': 'ETHUSDT',
  'BNBUSD': 'BNBUSDT',
  'SOLUSD': 'SOLUSDT',
  'XRPUSD': 'XRPUSDT',
  'ADAUSD': 'ADAUSDT',
  'DOGEUSD': 'DOGEUSDT',
  'DOTUSD': 'DOTUSDT',
  'MATICUSD': 'MATICUSDT',
  'LTCUSD': 'LTCUSDT',
  'AVAXUSD': 'AVAXUSDT',
  'LINKUSD': 'LINKUSDT'
}

// MetaAPI symbols - LIMITED to essential pairs to avoid rate limiting (429 errors)
// MetaAPI has strict rate limits, so we only fetch prices for major pairs
const METAAPI_SYMBOLS = [
  // Major Forex
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  // Cross pairs
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'GBPAUD', 'GBPCAD', 'AUDCAD', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
  // Metals
  'XAUUSD', 'XAGUSD'
]

// Fetch price from MetaAPI (forex/metals)
async function getMetaApiPrice(symbol) {
  try {
    const response = await fetch(
      `https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/${META_API_ACCOUNT_ID}/symbols/${symbol}/current-price`,
      {
        headers: {
          'auth-token': META_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      console.error(`MetaAPI error for ${symbol}: ${response.status}`)
      return null
    }
    const data = await response.json()
    if (data.bid) {
      return { bid: data.bid, ask: data.ask || data.bid }
    }
    return null
  } catch (e) {
    console.error(`MetaAPI error for ${symbol}:`, e.message)
    return null
  }
}

// Fetch price from Binance (crypto)
async function getBinancePrice(symbol) {
  const binanceSymbol = BINANCE_SYMBOLS[symbol]
  if (!binanceSymbol) return null
  
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${binanceSymbol}`)
    if (!response.ok) return null
    const data = await response.json()
    return {
      bid: parseFloat(data.bidPrice),
      ask: parseFloat(data.askPrice)
    }
  } catch (e) {
    console.error(`Binance error for ${symbol}:`, e.message)
    return null
  }
}

// Helper function to categorize symbols
function categorizeSymbol(symbol) {
  if (!symbol) return 'Forex'
  const s = symbol.toUpperCase()
  if (s.includes('XAU') || s.includes('XAG') || s.includes('XPT') || s.includes('XPD')) {
    return 'Metals'
  }
  if (s.includes('US30') || s.includes('US500') || s.includes('NAS') || s.includes('UK100') || s.includes('GER') || s.includes('JPN') || s.includes('AUS200')) {
    return 'Indices'
  }
  if (s.includes('OIL') || s.includes('BRENT') || s.includes('WTI') || s.includes('NATGAS')) {
    return 'Commodities'
  }
  if (BINANCE_SYMBOLS[symbol]) {
    return 'Crypto'
  }
  return 'Forex'
}

// Helper function to get crypto names
function getCryptoName(symbol) {
  const names = {
    'BTCUSD': 'Bitcoin',
    'ETHUSD': 'Ethereum',
    'BNBUSD': 'BNB',
    'SOLUSD': 'Solana',
    'XRPUSD': 'XRP',
    'ADAUSD': 'Cardano',
    'DOGEUSD': 'Dogecoin',
    'DOTUSD': 'Polkadot',
    'MATICUSD': 'Polygon',
    'LTCUSD': 'Litecoin',
    'AVAXUSD': 'Avalanche',
    'LINKUSD': 'Chainlink'
  }
  return names[symbol] || symbol
}

// Default instruments fallback
function getDefaultInstruments() {
  return [
    { symbol: 'EURUSD', name: 'EUR/USD', category: 'Forex', digits: 5 },
    { symbol: 'GBPUSD', name: 'GBP/USD', category: 'Forex', digits: 5 },
    { symbol: 'USDJPY', name: 'USD/JPY', category: 'Forex', digits: 3 },
    { symbol: 'USDCHF', name: 'USD/CHF', category: 'Forex', digits: 5 },
    { symbol: 'AUDUSD', name: 'AUD/USD', category: 'Forex', digits: 5 },
    { symbol: 'NZDUSD', name: 'NZD/USD', category: 'Forex', digits: 5 },
    { symbol: 'USDCAD', name: 'USD/CAD', category: 'Forex', digits: 5 },
    { symbol: 'EURGBP', name: 'EUR/GBP', category: 'Forex', digits: 5 },
    { symbol: 'EURJPY', name: 'EUR/JPY', category: 'Forex', digits: 3 },
    { symbol: 'GBPJPY', name: 'GBP/JPY', category: 'Forex', digits: 3 },
    { symbol: 'XAUUSD', name: 'Gold', category: 'Metals', digits: 2 },
    { symbol: 'XAGUSD', name: 'Silver', category: 'Metals', digits: 3 },
    { symbol: 'BTCUSD', name: 'Bitcoin', category: 'Crypto', digits: 2 },
    { symbol: 'ETHUSD', name: 'Ethereum', category: 'Crypto', digits: 2 },
  ]
}

// GET /api/prices/instruments - Get all available instruments (MUST be before /:symbol)
router.get('/instruments', async (req, res) => {
  try {
    // Fetch all symbols from MetaAPI
    console.log('Fetching instruments from MetaAPI account:', META_API_ACCOUNT_ID)
    const metaResponse = await fetch(
      `https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/${META_API_ACCOUNT_ID}/symbols`,
      {
        headers: {
          'auth-token': META_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    )
    
    let metaApiInstruments = []
    if (metaResponse.ok) {
      const symbols = await metaResponse.json()
      console.log('MetaAPI returned', symbols.length, 'symbols')
      // Log first symbol to see structure
      if (symbols.length > 0) {
        console.log('Sample symbol structure:', JSON.stringify(symbols[0]))
      }
      // MetaAPI returns symbols as strings, not objects
      metaApiInstruments = symbols
        .filter(s => s && (typeof s === 'string' || s.symbol))
        .map(s => {
          const symbolName = typeof s === 'string' ? s : s.symbol
          return {
            symbol: symbolName,
            name: (typeof s === 'object' && s.description) || symbolName,
            category: categorizeSymbol(symbolName),
            digits: (typeof s === 'object' && s.digits) || 5,
            contractSize: (typeof s === 'object' && s.contractSize) || 100000,
            minVolume: (typeof s === 'object' && s.minVolume) || 0.01,
            maxVolume: (typeof s === 'object' && s.maxVolume) || 100,
            volumeStep: (typeof s === 'object' && s.volumeStep) || 0.01
          }
        })
      console.log('Processed', metaApiInstruments.length, 'MetaAPI instruments')
    } else {
      console.error('MetaAPI symbols error:', metaResponse.status, await metaResponse.text())
    }
    
    // Add Binance crypto instruments
    const cryptoInstruments = Object.keys(BINANCE_SYMBOLS).map(symbol => ({
      symbol,
      name: getCryptoName(symbol),
      category: 'Crypto',
      digits: 2,
      contractSize: 1,
      minVolume: 0.01,
      maxVolume: 100,
      volumeStep: 0.01
    }))
    
    // Combine and deduplicate
    const allInstruments = [...metaApiInstruments, ...cryptoInstruments]
    const uniqueInstruments = allInstruments.filter((inst, index, self) =>
      index === self.findIndex(i => i.symbol === inst.symbol)
    )
    
    res.json({ success: true, instruments: uniqueInstruments })
  } catch (error) {
    console.error('Error fetching instruments:', error)
    // Return default instruments on error
    res.json({ success: true, instruments: getDefaultInstruments() })
  }
})

// GET /api/prices/:symbol - Get single symbol price
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    let price = null
    
    // Use MetaAPI for forex/metals
    if (METAAPI_SYMBOLS.includes(symbol)) {
      price = await getMetaApiPrice(symbol)
    }
    // Use Binance for crypto
    else if (BINANCE_SYMBOLS[symbol]) {
      price = await getBinancePrice(symbol)
    }
    
    if (price) {
      res.json({ success: true, price })
    } else {
      res.status(404).json({ success: false, message: 'Price not available' })
    }
  } catch (error) {
    console.error('Error fetching price:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Global price cache with background refresh
const priceCache = new Map()
const CACHE_TTL = 30000 // 30 second cache to avoid rate limits

// Background price streaming
let streamingInterval = null
let isRefreshing = false

async function refreshAllPrices() {
  if (isRefreshing) return // Prevent overlapping refreshes
  isRefreshing = true
  const now = Date.now()
  
  // Refresh Binance prices (single call for all crypto)
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/bookTicker')
    if (response.ok) {
      const allTickers = await response.json()
      const tickerMap = {}
      allTickers.forEach(t => { tickerMap[t.symbol] = t })
      
      Object.keys(BINANCE_SYMBOLS).forEach(symbol => {
        const binanceSymbol = BINANCE_SYMBOLS[symbol]
        const ticker = tickerMap[binanceSymbol]
        if (ticker) {
          priceCache.set(symbol, {
            price: { bid: parseFloat(ticker.bidPrice), ask: parseFloat(ticker.askPrice) },
            time: now
          })
        }
      })
    }
  } catch (e) {
    console.error('Binance refresh error:', e.message)
  }
  
  // Refresh MetaAPI prices (sequential with 1s delay to avoid rate limit)
  for (const symbol of METAAPI_SYMBOLS) {
    try {
      const price = await getMetaApiPrice(symbol)
      if (price) {
        priceCache.set(symbol, { price, time: now })
      }
    } catch (e) {
      // Silent fail
    }
    // 1 second delay between requests (max 1 req/sec for MetaAPI)
    await new Promise(r => setTimeout(r, 1000))
  }
  
  isRefreshing = false
  console.log('Prices refreshed:', priceCache.size, 'symbols')
}

// Start background streaming - disabled to avoid rate limits
// Prices are fetched on-demand instead
function startPriceStreaming() {
  console.log('Price streaming disabled - using on-demand fetching')
}

// Don't auto-start streaming
// startPriceStreaming()

// POST /api/prices/batch - Get multiple symbol prices
router.post('/batch', async (req, res) => {
  try {
    const { symbols } = req.body
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ success: false, message: 'symbols array required' })
    }
    
    const prices = {}
    const now = Date.now()
    
    // Get prices from cache first (2 second cache for real-time updates)
    const missingSymbols = []
    for (const symbol of symbols) {
      const cached = priceCache.get(symbol)
      if (cached && (now - cached.time) < 2000) {
        prices[symbol] = cached.price
      } else {
        missingSymbols.push(symbol)
      }
    }
    
    // Fetch missing prices in parallel
    if (missingSymbols.length > 0) {
      // Fetch Binance prices (single batch call)
      const binanceMissing = missingSymbols.filter(s => BINANCE_SYMBOLS[s])
      if (binanceMissing.length > 0) {
        try {
          const response = await fetch('https://api.binance.com/api/v3/ticker/bookTicker')
          if (response.ok) {
            const allTickers = await response.json()
            const tickerMap = {}
            allTickers.forEach(t => { tickerMap[t.symbol] = t })
            
            binanceMissing.forEach(symbol => {
              const binanceSymbol = BINANCE_SYMBOLS[symbol]
              const ticker = tickerMap[binanceSymbol]
              if (ticker) {
                const price = { bid: parseFloat(ticker.bidPrice), ask: parseFloat(ticker.askPrice) }
                prices[symbol] = price
                priceCache.set(symbol, { price, time: now })
              }
            })
          }
        } catch (e) {
          console.error('Binance batch error:', e.message)
        }
      }
      
      // Fetch MetaAPI prices in parallel (max 3 concurrent)
      const metaApiMissing = missingSymbols.filter(s => METAAPI_SYMBOLS.includes(s))
      if (metaApiMissing.length > 0) {
        const metaPromises = metaApiMissing.map(async (symbol) => {
          const price = await getMetaApiPrice(symbol)
          if (price) {
            prices[symbol] = price
            priceCache.set(symbol, { price, time: now })
          }
        })
        await Promise.allSettled(metaPromises)
      }
    }
    
    res.json({ success: true, prices })
  } catch (error) {
    console.error('Error fetching batch prices:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
