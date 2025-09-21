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

const API_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = import.meta.env.VITE_FINANCE_API_KEY || 'demo';

export const DEFAULT_FINANCE_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'];

const parseChangePercent = (value: unknown): number => {
  if (typeof value === 'number') {
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

const readNumber = (record: QuoteRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const numeric = Number(value.replace(/[^0-9+\-.]/g, ''));
      if (Number.isFinite(numeric)) {
        return numeric;
      }
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
  const rawValue = getFirstValue(record, ['timestamp', 'lastUpdated', 'lastUpdate', 'updated']);

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
    name: readString(quote, ['name', 'companyName', 'symbol'], 'Unknown'),
    price: readNumber(quote, ['price', 'currentPrice', 'c']) ?? 0,
    change: readNumber(quote, ['change', 'd', 'dayChange']) ?? 0,
    changePercent: parseChangePercent(
      getFirstValue(quote, ['changesPercentage', 'dp', 'dayChangePerc'])
    ),
    marketCap: readNumber(quote, ['marketCap', 'marketCapitalization']),
    volume: readNumber(quote, ['volume', 'avgVolume', 'volAvg']),
    open: readNumber(quote, ['open']),
    previousClose: readNumber(quote, ['previousClose', 'pc']),
    dayHigh: readNumber(quote, ['dayHigh', 'h']),
    dayLow: readNumber(quote, ['dayLow', 'l']),
    yearHigh: readNumber(quote, ['yearHigh', 'yearHigh52Weeks']),
    yearLow: readNumber(quote, ['yearLow', 'yearLow52Weeks']),
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

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  if (!symbols.length) {
    return [];
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))).filter(Boolean);
  if (uniqueSymbols.length === 0) {
    return [];
  }

  const endpoint = createUrl(`quote/${uniqueSymbols.join(',')}`);
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

export const fetchMarketMovers = async (
  type: 'gainers' | 'losers' | 'actives'
): Promise<StockQuote[]> => {
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

