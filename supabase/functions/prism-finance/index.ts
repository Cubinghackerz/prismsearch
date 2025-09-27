import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const POLYGON_API_KEY = Deno.env.get("POLYGON_IO_API_KEY");

if (!POLYGON_API_KEY) {
  console.error("POLYGON_IO_API_KEY is not configured");
}

const baseHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

type HistoricalRange = "1D" | "5D" | "1M" | "3M" | "1Y";

type SnapshotTicker = {
  ticker: string;
  name?: string;
  day?: {
    o?: number;
    h?: number;
    l?: number;
    c?: number;
    v?: number;
    change?: number;
    changePercent?: number;
  };
  prevDay?: {
    c?: number;
    o?: number;
    h?: number;
    l?: number;
    v?: number;
  };
  lastQuote?: {
    p?: number;
  };
  lastTrade?: {
    p?: number;
  };
  todaysChange?: number;
  todaysChangePerc?: number;
  marketCap?: number;
  currency?: string;
  updated?: number;
};

type PolygonResult<T> = {
  status?: string;
  results?: T;
  tickers?: SnapshotTicker[];
};

const buildPolygonUrl = (path: string, params: Record<string, string | number | undefined> = {}) => {
  const url = new URL(`https://api.polygon.io/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set("apiKey", POLYGON_API_KEY ?? "");
  return url.toString();
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Polygon request failed (${response.status}): ${text}`);
  }
  return (await response.json()) as T;
};

const formatIso = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) {
    return new Date().toISOString();
  }
  const timestamp = value > 1e12 ? value : value * 1000;
  return new Date(timestamp).toISOString();
};

const normalizeQuote = (ticker: SnapshotTicker, details?: { market_cap?: number | null }) => {
  const day = ticker.day ?? {};
  const prev = ticker.prevDay ?? {};
  const lastTradePrice = ticker.lastTrade?.p;
  const lastQuotePrice = ticker.lastQuote?.p;
  const closePrice = typeof day.c === "number" ? day.c : undefined;
  const price =
    typeof lastTradePrice === "number"
      ? lastTradePrice
      : typeof lastQuotePrice === "number"
      ? lastQuotePrice
      : typeof closePrice === "number"
      ? closePrice
      : typeof prev.c === "number"
      ? prev.c
      : 0;

  const change =
    typeof ticker.todaysChange === "number"
      ? ticker.todaysChange
      : typeof day.change === "number"
      ? day.change
      : typeof prev.c === "number" && typeof price === "number"
      ? price - prev.c
      : 0;

  const changePercent =
    typeof ticker.todaysChangePerc === "number"
      ? ticker.todaysChangePerc
      : typeof day.changePercent === "number"
      ? day.changePercent
      : typeof prev.c === "number" && prev.c !== 0
      ? (change / prev.c) * 100
      : 0;

  return {
    symbol: ticker.ticker,
    name: ticker.name ?? ticker.ticker,
    price,
    change,
    changePercent,
    marketCap: details?.market_cap ?? ticker.marketCap ?? undefined,
    volume: day.v ?? prev.v ?? undefined,
    open: day.o ?? undefined,
    previousClose: prev.c ?? undefined,
    dayHigh: day.h ?? undefined,
    dayLow: day.l ?? undefined,
    currency: ticker.currency ?? "USD",
    updatedAt: formatIso(ticker.updated),
  };
};

const RANGE_CONFIG: Record<HistoricalRange, { multiplier: number; timespan: string; daysBack: number; limit?: number }> = {
  "1D": { multiplier: 5, timespan: "minute", daysBack: 2, limit: 500 },
  "5D": { multiplier: 15, timespan: "minute", daysBack: 7, limit: 500 },
  "1M": { multiplier: 1, timespan: "day", daysBack: 40, limit: 1200 },
  "3M": { multiplier: 1, timespan: "day", daysBack: 110, limit: 1200 },
  "1Y": { multiplier: 1, timespan: "week", daysBack: 370, limit: 1200 },
};

const formatDate = (input: Date) => input.toISOString().split("T")[0];

const fetchHistory = async (symbol: string, range: HistoricalRange) => {
  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG["1M"];
  const now = new Date();
  const fromDate = new Date(now.getTime() - config.daysBack * 24 * 60 * 60 * 1000);
  const url = buildPolygonUrl(
    `v2/aggs/ticker/${symbol}/range/${config.multiplier}/${config.timespan}/${formatDate(fromDate)}/${formatDate(now)}`,
    {
      adjusted: "true",
      sort: "asc",
      limit: config.limit ?? 5000,
    },
  );

  const payload = await fetchJson<PolygonResult<Array<{ t: number; c: number; v?: number }>>>(url);
  const results = payload.results ?? [];

  return results
    .filter((item) => typeof item.t === "number" && typeof item.c === "number")
    .map((item) => ({
      time: new Date(item.t).toISOString(),
      close: item.c,
      volume: item.v ?? undefined,
    }));
};

const fetchTickerDetails = async (symbols: string[]) => {
  const entries = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const url = buildPolygonUrl(`v3/reference/tickers/${symbol}`);
        const payload = await fetchJson<{ results?: { market_cap?: number | null } }>(url);
        return [symbol, payload.results ?? null] as const;
      } catch (error) {
        console.warn(`Unable to load reference data for ${symbol}:`, error);
        return [symbol, null] as const;
      }
    }),
  );

  return new Map(entries);
};

const handleQuotes = async (request: URL) => {
  const symbolsParam = request.searchParams.get("symbols");
  if (!symbolsParam) {
    return new Response(
      JSON.stringify({ error: "Missing symbols parameter" }),
      { status: 400, headers: baseHeaders },
    );
  }

  const includeHistory = request.searchParams.get("includeHistory") === "true";
  const range = (request.searchParams.get("range") as HistoricalRange) ?? "5D";

  const symbols = Array.from(
    new Set(
      symbolsParam
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  );

  if (symbols.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid symbols provided" }),
      { status: 400, headers: baseHeaders },
    );
  }

  const snapshotUrl = buildPolygonUrl("v2/snapshot/locale/us/markets/stocks/tickers", {
    tickers: symbols.join(","),
  });

  const snapshotPayload = await fetchJson<{ tickers?: SnapshotTicker[] }>(snapshotUrl);
  const tickers = snapshotPayload.tickers ?? [];

  const detailMap = await fetchTickerDetails(symbols);

  const quotes = [] as Array<Record<string, unknown>>;

  for (const ticker of tickers) {
    const normalized = normalizeQuote(ticker, detailMap.get(ticker.ticker) ?? undefined);
    if (includeHistory) {
      try {
        normalized.history = await fetchHistory(ticker.ticker, range);
      } catch (error) {
        console.warn(`History fetch failed for ${ticker.ticker}:`, error);
      }
    }
    quotes.push(normalized);
  }

  return new Response(
    JSON.stringify({
      quotes,
      source: "Polygon.io US equities snapshot",
      fetchedAt: new Date().toISOString(),
      usedFallbackSource: false,
      coverage: "US equities only",
    }),
    { status: 200, headers: baseHeaders },
  );
};

const MOVERS_ENDPOINT: Record<string, string> = {
  gainers: "v2/snapshot/locale/us/markets/stocks/gainers",
  losers: "v2/snapshot/locale/us/markets/stocks/losers",
  actives: "v2/snapshot/locale/us/markets/stocks/most-active",
};

const handleMovers = async (request: URL) => {
  const type = request.searchParams.get("type") ?? "gainers";
  const endpoint = MOVERS_ENDPOINT[type] ?? MOVERS_ENDPOINT.gainers;

  const url = buildPolygonUrl(endpoint);
  const payload = await fetchJson<{ tickers?: SnapshotTicker[] }>(url);
  const tickers = payload.tickers ?? [];

  const quotes = tickers.slice(0, 12).map((item) => normalizeQuote(item));

  return new Response(
    JSON.stringify({
      quotes,
      source: "Polygon.io market movers",
      fetchedAt: new Date().toISOString(),
      usedFallbackSource: false,
      coverage: "US equities only",
    }),
    { status: 200, headers: baseHeaders },
  );
};

const handleHistory = async (request: URL) => {
  const symbol = request.searchParams.get("symbol");
  if (!symbol) {
    return new Response(JSON.stringify({ error: "Missing symbol" }), {
      status: 400,
      headers: baseHeaders,
    });
  }

  const range = (request.searchParams.get("range") as HistoricalRange) ?? "1M";

  const points = await fetchHistory(symbol.toUpperCase(), range);

  return new Response(
    JSON.stringify({
      symbol: symbol.toUpperCase(),
      range,
      points,
      source: "Polygon.io aggregates",
      fetchedAt: new Date().toISOString(),
      coverage: "US equities only",
    }),
    { status: 200, headers: baseHeaders },
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: baseHeaders });
  }

  if (!POLYGON_API_KEY) {
    return new Response(JSON.stringify({ error: "Polygon API key is not configured" }), {
      status: 500,
      headers: baseHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") ?? "quotes";

    if (resource === "quotes") {
      return await handleQuotes(url);
    }
    if (resource === "movers") {
      return await handleMovers(url);
    }
    if (resource === "history") {
      return await handleHistory(url);
    }

    return new Response(JSON.stringify({ error: "Unknown resource" }), {
      status: 400,
      headers: baseHeaders,
    });
  } catch (error) {
    console.error("Prism Finance function error", error);
    return new Response(JSON.stringify({ error: error.message ?? "Unexpected error" }), {
      status: 500,
      headers: baseHeaders,
    });
  }
});
