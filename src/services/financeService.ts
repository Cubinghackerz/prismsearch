import { format } from 'date-fns';

export interface PricePoint {
  time: string;
  close: number;
  volume?: number;
}

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
  history?: PricePoint[];
}

export interface StockQuoteResponse {
  quotes: StockQuote[];
  source: string;
  fetchedAt: string;
  usedFallbackSource: boolean;
  coverage?: string;
}

export interface MarketMoversResponse {
  quotes: StockQuote[];
  source: string;
  fetchedAt: string;
  usedFallbackSource: boolean;
  coverage?: string;
}

export type HistoricalRange = '1D' | '5D' | '1M' | '3M' | '1Y';

export interface HistoricalSeries {
  symbol: string;
  range: HistoricalRange;
  points: PricePoint[];
  source: string;
  fetchedAt: string;
  coverage?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fgpdfkvabwemivzjeitx.supabase.co';
const PRISM_FINANCE_URL = `${SUPABASE_URL}/functions/v1/prism-finance`;
const POLYGON_CLIENT_KEY = import.meta.env.VITE_POLYGON_IO_API_KEY;

const SIX_TIMES_DAILY_INTERVAL_MS = 1000 * 60 * 60 * 4; // 4 hours
const ONE_HOUR_MS = 1000 * 60 * 60;

export const FINANCE_REFRESH_INTERVAL_MS = SIX_TIMES_DAILY_INTERVAL_MS;

export const DEFAULT_FINANCE_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'];

interface CacheEntry<T> {
  timestamp: number;
  payload: T;
}

const quoteCache = new Map<string, CacheEntry<StockQuoteResponse>>();
const moversCache = new Map<string, CacheEntry<MarketMoversResponse>>();
const historyCache = new Map<string, CacheEntry<HistoricalSeries>>();

const toCacheKey = (symbols: string[], options: { includeHistory?: boolean; historyRange?: HistoricalRange }) => {
  const base = symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');

  if (!options.includeHistory) {
    return base;
  }

  return `${base}|history:${options.historyRange ?? '5D'}`;
};

const isCacheValid = (timestamp: number, ttl: number, forceRefresh?: boolean) => {
  if (forceRefresh) {
    return false;
  }

  return Date.now() - timestamp < ttl;
};

const buildFunctionUrl = (params: Record<string, string | number | undefined>) => {
  const url = new URL(PRISM_FINANCE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const coerceNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return undefined;
};

const normalizeHistory = (history: unknown): PricePoint[] | undefined => {
  if (!Array.isArray(history)) {
    return undefined;
  }

  return history
    .map((item) => {
      const time = typeof item?.time === 'string' ? item.time : typeof item?.t === 'number' ? new Date(item.t).toISOString() : null;
      const close = coerceNumber(item?.close ?? item?.c);
      const volume = coerceNumber(item?.volume ?? item?.v);

      if (!time || close === undefined) {
        return null;
      }

      return {
        time,
        close,
        volume,
      } satisfies PricePoint;
    })
    .filter((point): point is PricePoint => point !== null);
};

const normalizeQuote = (quote: Record<string, unknown>): StockQuote => {
  const price = coerceNumber(quote.price) ?? 0;
  const change = coerceNumber(quote.change) ?? 0;
  const changePercent = coerceNumber(quote.changePercent) ?? 0;

  return {
    symbol: typeof quote.symbol === 'string' ? quote.symbol : 'N/A',
    name: typeof quote.name === 'string' ? quote.name : typeof quote.symbol === 'string' ? quote.symbol : 'Unknown',
    price,
    change,
    changePercent,
    marketCap: coerceNumber(quote.marketCap),
    volume: coerceNumber(quote.volume),
    open: coerceNumber(quote.open),
    previousClose: coerceNumber(quote.previousClose),
    dayHigh: coerceNumber(quote.dayHigh),
    dayLow: coerceNumber(quote.dayLow),
    yearHigh: coerceNumber(quote.yearHigh),
    yearLow: coerceNumber(quote.yearLow),
    currency: typeof quote.currency === 'string' ? quote.currency : 'USD',
    updatedAt: typeof quote.updatedAt === 'string' ? quote.updatedAt : format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    history: normalizeHistory(quote.history),
  };
};

export const fetchStockQuotes = async (
  symbols: string[],
  options: { forceRefresh?: boolean; includeHistory?: boolean; historyRange?: HistoricalRange } = {},
): Promise<StockQuoteResponse> => {
  const uniqueSymbols = Array.from(new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))).filter(Boolean);

  if (uniqueSymbols.length === 0) {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    return {
      quotes: [],
      source: 'Polygon.io US equities snapshot',
      fetchedAt: now,
      usedFallbackSource: false,
      coverage: 'US equities only',
    };
  }

  const cacheKey = toCacheKey(uniqueSymbols, options);
  const cached = quoteCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp, SIX_TIMES_DAILY_INTERVAL_MS, options.forceRefresh)) {
    return cached.payload;
  }

  const url = buildFunctionUrl({
    resource: 'quotes',
    symbols: uniqueSymbols.join(','),
    includeHistory: options.includeHistory ? 'true' : undefined,
    range: options.includeHistory ? options.historyRange ?? '5D' : undefined,
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch Polygon finance data (${response.status})`);
  }

  const payload = await response.json();
  const quotes = Array.isArray(payload?.quotes) ? payload.quotes.map((quote: Record<string, unknown>) => normalizeQuote(quote)) : [];

  const result: StockQuoteResponse = {
    quotes,
    source: typeof payload?.source === 'string' ? payload.source : 'Polygon.io US equities snapshot',
    fetchedAt: typeof payload?.fetchedAt === 'string' ? payload.fetchedAt : format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    usedFallbackSource: Boolean(payload?.usedFallbackSource),
    coverage: typeof payload?.coverage === 'string' ? payload.coverage : 'US equities only',
  };

  quoteCache.set(cacheKey, { timestamp: Date.now(), payload: result });
  return result;
};

export const fetchMarketMovers = async (
  type: 'gainers' | 'losers' | 'actives',
  options: { forceRefresh?: boolean } = {},
): Promise<MarketMoversResponse> => {
  const cacheKey = `movers:${type}`;
  const cached = moversCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp, SIX_TIMES_DAILY_INTERVAL_MS, options.forceRefresh)) {
    return cached.payload;
  }

  const url = buildFunctionUrl({ resource: 'movers', type });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch Polygon movers (${response.status})`);
  }

  const payload = await response.json();
  const quotes = Array.isArray(payload?.quotes) ? payload.quotes.map((quote: Record<string, unknown>) => normalizeQuote(quote)) : [];

  const result: MarketMoversResponse = {
    quotes,
    source: typeof payload?.source === 'string' ? payload.source : 'Polygon.io market movers',
    fetchedAt: typeof payload?.fetchedAt === 'string' ? payload.fetchedAt : format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    usedFallbackSource: Boolean(payload?.usedFallbackSource),
    coverage: typeof payload?.coverage === 'string' ? payload.coverage : 'US equities only',
  };

  moversCache.set(cacheKey, { timestamp: Date.now(), payload: result });
  return result;
};

export const fetchHistoricalSeries = async (
  symbol: string,
  range: HistoricalRange,
  options: { forceRefresh?: boolean } = {},
): Promise<HistoricalSeries> => {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const cacheKey = `${normalizedSymbol}|${range}`;
  const cacheTtl = range === '1D' ? ONE_HOUR_MS : SIX_TIMES_DAILY_INTERVAL_MS;
  const cached = historyCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp, cacheTtl, options.forceRefresh)) {
    return cached.payload;
  }

  const url = buildFunctionUrl({ resource: 'history', symbol: normalizedSymbol, range });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch history for ${normalizedSymbol}`);
  }

  const payload = await response.json();
  const series: HistoricalSeries = {
    symbol: typeof payload?.symbol === 'string' ? payload.symbol : normalizedSymbol,
    range: (payload?.range as HistoricalRange) ?? range,
    points: normalizeHistory(payload?.points) ?? [],
    source: typeof payload?.source === 'string' ? payload.source : 'Polygon.io aggregates',
    fetchedAt: typeof payload?.fetchedAt === 'string' ? payload.fetchedAt : format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
    coverage: typeof payload?.coverage === 'string' ? payload.coverage : 'US equities only',
  };

  historyCache.set(cacheKey, { timestamp: Date.now(), payload: series });
  return series;
};

export const searchSymbols = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  if (!POLYGON_CLIENT_KEY) {
    console.warn('Polygon search API key not configured; skipping symbol search.');
    return [];
  }

  const response = await fetch(
    `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(trimmed)}&market=stocks&active=true&limit=10&apiKey=${
      POLYGON_CLIENT_KEY
    }`,
  );

  if (!response.ok) {
    throw new Error('Unable to search symbols');
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results.map((item: Record<string, unknown>) => ({
    symbol: typeof item.ticker === 'string' ? item.ticker : 'N/A',
    name: typeof item.name === 'string' ? item.name : 'Unknown Company',
    exchange: typeof item.primary_exchange === 'string' ? item.primary_exchange : 'US',
    currency: typeof item.currency_name === 'string' ? item.currency_name : 'USD',
  }));
};
