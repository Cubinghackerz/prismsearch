import { format } from 'date-fns';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  open?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  yearHigh?: number;
  yearLow?: number;
  currency?: string;
  updatedAt: string;
}

export interface StockQuoteResponse {
  quotes: StockQuote[];
  source: string;
  fetchedAt: string;
  usedFallbackSource: boolean;
}

export interface MarketMoversResponse {
  quotes: StockQuote[];
  source: string;
  fetchedAt: string;
  usedFallbackSource: boolean;
}

const API_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = import.meta.env.VITE_FINANCE_API_KEY || 'demo';

const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_SCREENER_URL = 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved';

const SIX_TIMES_DAILY_INTERVAL_MS = 1000 * 60 * 60 * 4; // 4 hours

export const FINANCE_REFRESH_INTERVAL_MS = SIX_TIMES_DAILY_INTERVAL_MS;

export const DEFAULT_FINANCE_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'];

const parseChangePercent = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[+%]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
};

type QuoteRecord = Record<string, unknown>;

const getFirstValue = (record: QuoteRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) {
      const value = record[key];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
  }

  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = Number(value.replace(/[^0-9+\-.]/g, ''));
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return undefined;
};

const readNumber = (record: QuoteRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const candidate = toNumber(record[key]);
    if (candidate !== undefined) {
      return candidate;
    }
  }

  return undefined;
};

const readString = (record: QuoteRecord, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return fallback;
};

const resolveTimestamp = (record: QuoteRecord): number => {
  const rawValue = getFirstValue(record, [
    'timestamp',
    'lastUpdated',
    'lastUpdate',
    'updated',
    'regularMarketTime',
  ]);

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue > 1e12 ? rawValue : rawValue * 1000;
  }

  if (typeof rawValue === 'string') {
    const numeric = Number(rawValue);
    if (Number.isFinite(numeric)) {
      return numeric > 1e12 ? numeric : numeric * 1000;
    }
  }

  return Date.now();
};

const normalizeQuote = (quote: QuoteRecord): StockQuote => {
  const timestamp = resolveTimestamp(quote);

  return {
    symbol: readString(quote, ['symbol', 'ticker'], 'N/A'),
    name: readString(
      quote,
      ['name', 'companyName', 'symbol', 'shortName', 'longName', 'displayName'],
      'Unknown'
    ),
    price: readNumber(quote, ['price', 'currentPrice', 'c', 'regularMarketPrice']) ?? 0,
    change: readNumber(quote, ['change', 'd', 'dayChange', 'regularMarketChange']) ?? 0,
    changePercent:
      parseChangePercent(
        getFirstValue(quote, ['changesPercentage', 'dp', 'dayChangePerc', 'regularMarketChangePercent'])
      ) ?? 0,
    marketCap: readNumber(quote, ['marketCap', 'marketCapitalization']),
    volume: readNumber(quote, ['volume', 'avgVolume', 'volAvg', 'regularMarketVolume']),
    open: readNumber(quote, ['open', 'regularMarketOpen']),
    previousClose: readNumber(quote, ['previousClose', 'pc', 'regularMarketPreviousClose']),
    dayHigh: readNumber(quote, ['dayHigh', 'h', 'regularMarketDayHigh']),
    dayLow: readNumber(quote, ['dayLow', 'l', 'regularMarketDayLow']),
    yearHigh: readNumber(quote, ['yearHigh', 'yearHigh52Weeks', 'fiftyTwoWeekHigh']),
    yearLow: readNumber(quote, ['yearLow', 'yearLow52Weeks', 'fiftyTwoWeekLow']),
    currency: readString(quote, ['currency', 'currencyCode'], 'USD'),
    updatedAt: format(timestamp, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  };
};

const createUrl = (path: string, params: Record<string, string | number | undefined> = {}) => {
  const url = new URL(`${API_BASE_URL}/${path}`);
  const urlParams = new URLSearchParams({ apikey: API_KEY });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, String(value));
    }
  });

  url.search = urlParams.toString();
  return url.toString();
};

const toCacheKey = (symbols: string[]): string =>
  symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');

const isCacheValid = (timestamp: number, forceRefresh?: boolean) => {
  if (forceRefresh) {
    return false;
  }
  return Date.now() - timestamp < SIX_TIMES_DAILY_INTERVAL_MS;
};

interface CacheEntry<T> {
  timestamp: number;
  payload: T;
}

const quoteCache = new Map<string, CacheEntry<StockQuoteResponse>>();
const moversCache = new Map<string, CacheEntry<MarketMoversResponse>>();

const fetchFromFmp = async (symbols: string[]): Promise<StockQuote[]> => {
  if (!symbols.length) {
    return [];
  }

  const endpoint = createUrl(`quote/${symbols.join(',')}`);
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Unable to fetch stock data (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalizeQuote).filter((quote) => Number.isFinite(quote.price));
};

const fetchMoversFromFmp = async (type: 'gainers' | 'losers' | 'actives'): Promise<StockQuote[]> => {
  const endpoint = createUrl(`stock_market/${type}`);
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Unable to fetch market ${type}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.slice(0, 8).map(normalizeQuote);
};

const fetchFromYahoo = async (symbols: string[]): Promise<StockQuote[]> => {
  if (!symbols.length) {
    return [];
  }

  const endpoint = `${YAHOO_QUOTE_URL}?symbols=${encodeURIComponent(symbols.join(','))}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Unable to fetch Yahoo Finance data (${response.status})`);
  }

  const payload = await response.json();
  const results: QuoteRecord[] = payload?.quoteResponse?.result ?? [];

  return results.map(normalizeQuote).filter((quote) => Number.isFinite(quote.price));
};

const YAHOO_SCREENER_IDS: Record<'gainers' | 'losers' | 'actives', string> = {
  gainers: 'day_gainers',
  losers: 'day_losers',
  actives: 'most_actives',
};

const fetchMoversFromYahoo = async (type: 'gainers' | 'losers' | 'actives'): Promise<StockQuote[]> => {
  const endpoint = `${YAHOO_SCREENER_URL}?scrIds=${YAHOO_SCREENER_IDS[type]}&count=25`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Unable to fetch Yahoo Finance ${type}`);
  }

  const payload = await response.json();
  const results: QuoteRecord[] = payload?.finance?.result?.[0]?.quotes ?? [];

  return results.slice(0, 8).map(normalizeQuote).filter((quote) => Number.isFinite(quote.price));
};

export const fetchStockQuotes = async (
  symbols: string[],
  options: { forceRefresh?: boolean } = {}
): Promise<StockQuoteResponse> => {
  const uniqueSymbols = Array.from(new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))).filter(Boolean);

  if (uniqueSymbols.length === 0) {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    return {
      quotes: [],
      source: 'No symbols provided',
      fetchedAt: now,
      usedFallbackSource: false,
    };
  }

  const cacheKey = toCacheKey(uniqueSymbols);
  const cached = quoteCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp, options.forceRefresh)) {
    return cached.payload;
  }

  let quotes: StockQuote[] = [];
  let sourceLabel = 'Financial Modeling Prep API';
  let usedFallbackSource = false;
  let lastError: unknown = null;

  try {
    quotes = await fetchFromFmp(uniqueSymbols);
  } catch (error) {
    lastError = error;
    console.warn('Primary finance API failed:', error);
  }

  if (!quotes.length) {
    try {
      quotes = await fetchFromYahoo(uniqueSymbols);
      sourceLabel = 'Yahoo Finance snapshot via Prism Web Agent';
      usedFallbackSource = true;
    } catch (fallbackError) {
      lastError = fallbackError;
      console.error('Fallback finance fetch failed:', fallbackError);
    }
  }

  if (!quotes.length && lastError) {
    sourceLabel = 'Live market data temporarily unavailable';
  }

  const payload: StockQuoteResponse = {
    quotes,
    source: sourceLabel,
    fetchedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    usedFallbackSource,
  };

  quoteCache.set(cacheKey, { timestamp: Date.now(), payload });
  return payload;
};

export const fetchMarketMovers = async (
  type: 'gainers' | 'losers' | 'actives',
  options: { forceRefresh?: boolean } = {}
): Promise<MarketMoversResponse> => {
  const cacheKey = `movers:${type}`;
  const cached = moversCache.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp, options.forceRefresh)) {
    return cached.payload;
  }

  let quotes: StockQuote[] = [];
  let sourceLabel = 'Financial Modeling Prep API';
  let usedFallbackSource = false;
  let lastError: unknown = null;

  try {
    quotes = await fetchMoversFromFmp(type);
  } catch (error) {
    lastError = error;
    console.warn(`Primary finance movers fetch failed (${type}):`, error);
  }

  if (!quotes.length) {
    try {
      quotes = await fetchMoversFromYahoo(type);
      sourceLabel = 'Yahoo Finance screener via Prism Web Agent';
      usedFallbackSource = true;
    } catch (fallbackError) {
      lastError = fallbackError;
      console.error(`Fallback movers fetch failed (${type}):`, fallbackError);
    }
  }

  if (!quotes.length && lastError) {
    sourceLabel = 'Market movers temporarily unavailable';
  }

  const payload: MarketMoversResponse = {
    quotes,
    source: sourceLabel,
    fetchedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    usedFallbackSource,
  };

  moversCache.set(cacheKey, { timestamp: Date.now(), payload });
  return payload;
};

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

export const searchSymbols = async (query: string): Promise<SymbolSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const endpoint = createUrl('search', { query: trimmed, limit: 10, exchange: 'NASDAQ' });
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Unable to search symbols');
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => ({
    symbol: item.symbol ?? item.ticker ?? 'N/A',
    name: item.name ?? 'Unknown Company',
    exchange: item.stockExchange ?? item.exchangeShortName ?? 'Unknown Exchange',
    currency: item.currency ?? 'USD',
  }));
};
