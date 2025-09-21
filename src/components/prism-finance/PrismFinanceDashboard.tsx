import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  DEFAULT_FINANCE_SYMBOLS,
  FINANCE_REFRESH_INTERVAL_MS,
  MarketMoversResponse,
  StockQuote,
  fetchMarketMovers,
  fetchStockQuotes,
} from '@/services/financeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowDownRight, ArrowUpRight, Loader2, Plus, RefreshCw, X } from 'lucide-react';

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 100 ? 2 : 4,
    maximumFractionDigits: 4,
  }).format(value);
};

const formatCompactNumber = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const WatchlistCard: React.FC<{ quote: StockQuote }> = ({ quote }) => {
  const isUp = quote.change >= 0;
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
  const trendColor = isUp ? 'text-emerald-500' : 'text-rose-500';

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{quote.symbol}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/90">{quote.name}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[0.65rem] uppercase tracking-[0.3em]">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-semibold text-foreground">{formatCurrency(quote.price)}</div>
          <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>
              {quote.change >= 0 ? '+' : ''}
              {quote.change.toFixed(2)}
            </span>
            <span className="opacity-80">
              ({quote.changePercent >= 0 ? '+' : ''}
              {quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-muted-foreground/90">
          <div>
            <dt className="uppercase tracking-[0.2em] text-[0.6rem]">Volume</dt>
            <dd className="text-foreground/90 font-semibold">{formatCompactNumber(quote.volume)}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.2em] text-[0.6rem]">Market Cap</dt>
            <dd className="text-foreground/90 font-semibold">{formatCompactNumber(quote.marketCap)}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.2em] text-[0.6rem]">Day Range</dt>
            <dd className="text-foreground/90 font-semibold">
              {formatCurrency(quote.dayLow)} – {formatCurrency(quote.dayHigh)}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.2em] text-[0.6rem]">Prev Close</dt>
            <dd className="text-foreground/90 font-semibold">{formatCurrency(quote.previousClose)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

const MoversList: React.FC<{ title: string; response?: MarketMoversResponse; isLoading: boolean }> = ({
  title,
  response,
  isLoading,
}) => (
  <Card className="border-border/60 bg-card/60 backdrop-blur">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
      <CardDescription className="text-xs text-muted-foreground">
        Auto-refreshes at least six times per day. Manual refresh pulls the latest web snapshot when available.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching latest movers…
        </div>
      )}
      {!isLoading && response && response.quotes.length > 0 && (
        <ul className="space-y-2 text-sm">
          {response.quotes.slice(0, 6).map((quote) => {
            const isUp = quote.changePercent >= 0;
            return (
              <li
                key={quote.symbol}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-foreground">{quote.symbol}</p>
                  <p className="text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">{quote.name}</p>
                </div>
                <div className={`text-sm font-semibold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {!isLoading && (!response || response.quotes.length === 0) && (
        <p className="text-xs text-muted-foreground">No data available right now. Please check back shortly.</p>
      )}
      {!isLoading && response && (
        <p className="text-[0.65rem] text-muted-foreground/80">
          Source: {response.source}
          {response.usedFallbackSource ? ' • Web snapshot fallback active' : ''}
        </p>
      )}
    </CardContent>
  </Card>
);

const PrismFinanceDashboard: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_FINANCE_SYMBOLS);
  const [newSymbol, setNewSymbol] = useState('');
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [symbolError, setSymbolError] = useState('');
  const [manualRefreshLoading, setManualRefreshLoading] = useState(false);

  const {
    data: watchlistResponse,
    isLoading: isWatchlistLoading,
    error: watchlistError,
    refetch: refetchWatchlist,
  } = useQuery({
    queryKey: ['finance', 'watchlist', watchlist],
    queryFn: () => fetchStockQuotes(watchlist),
    enabled: watchlist.length > 0,
    refetchInterval: FINANCE_REFRESH_INTERVAL_MS,
  });

  const watchlistQuotes = watchlistResponse?.quotes ?? [];

  const { data: gainersResponse, isLoading: gainersLoading, refetch: refetchGainers } = useQuery({
    queryKey: ['finance', 'movers', 'gainers'],
    queryFn: () => fetchMarketMovers('gainers'),
    refetchInterval: FINANCE_REFRESH_INTERVAL_MS,
  });

  const { data: losersResponse, isLoading: losersLoading, refetch: refetchLosers } = useQuery({
    queryKey: ['finance', 'movers', 'losers'],
    queryFn: () => fetchMarketMovers('losers'),
    refetchInterval: FINANCE_REFRESH_INTERVAL_MS,
  });

  const { data: activesResponse, isLoading: activesLoading, refetch: refetchActives } = useQuery({
    queryKey: ['finance', 'movers', 'actives'],
    queryFn: () => fetchMarketMovers('actives'),
    refetchInterval: FINANCE_REFRESH_INTERVAL_MS,
  });

  const lastUpdated = watchlistResponse?.fetchedAt ?? null;

  const handleManualRefresh = async () => {
    setManualRefreshLoading(true);
    try {
      await Promise.all([
        refetchWatchlist({ throwOnError: false, cancelRefetch: false }),
        refetchGainers({ throwOnError: false, cancelRefetch: false }),
        refetchLosers({ throwOnError: false, cancelRefetch: false }),
        refetchActives({ throwOnError: false, cancelRefetch: false }),
      ]);
    } finally {
      setManualRefreshLoading(false);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setWatchlist((prev) => prev.filter((ticker) => ticker !== symbol));
  };

  const handleAddSymbol = async () => {
    const trimmed = newSymbol.trim().toUpperCase();
    if (!trimmed) {
      setSymbolError('Enter a ticker symbol (e.g., AAPL).');
      return;
    }

    if (watchlist.includes(trimmed)) {
      setSymbolError('That ticker is already in your watchlist.');
      return;
    }

    setSymbolError('');
    setAddingSymbol(true);

    try {
      const response = await fetchStockQuotes([trimmed], { forceRefresh: true });
      const [quote] = response.quotes;
      if (!quote) {
        setSymbolError('Ticker not found. Double-check the symbol and try again.');
        return;
      }

      setWatchlist((prev) => [...prev, trimmed]);
      setNewSymbol('');
      refetchWatchlist();
    } catch (error) {
      console.error('Error adding ticker:', error);
      setSymbolError('Unable to verify that ticker right now. Please try again later.');
    } finally {
      setAddingSymbol(false);
    }
  };

  return (
    <section id="prism-finance-dashboard" className="space-y-10">
      <div className="flex flex-col gap-6 rounded-3xl border border-border/50 bg-background/70 p-6 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Live watchlist</h2>
            <p className="text-sm text-muted-foreground">
              Refreshes automatically throughout the trading day (six scheduled updates). Use manual refresh for the newest web snapshot.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Input
                value={newSymbol}
                onChange={(event) => {
                  setNewSymbol(event.target.value);
                  if (symbolError) {
                    setSymbolError('');
                  }
                }}
                placeholder="Add ticker (e.g., TSLA)"
                className="w-48 uppercase tracking-[0.2em]"
              />
              <Button type="button" onClick={handleAddSymbol} disabled={addingSymbol}>
                {addingSymbol ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 rounded-full"
                onClick={handleManualRefresh}
                disabled={manualRefreshLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${manualRefreshLoading ? 'animate-spin' : ''}`} />
                Refresh now
              </Button>
              {lastUpdated && (
                <span className="flex items-center gap-2">
                  Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>

        {symbolError && <p className="text-xs text-rose-500">{symbolError}</p>}
        {watchlistError && <p className="text-xs text-rose-500">Unable to load watchlist. Please try again later.</p>}

        <div className="flex flex-wrap gap-2">
          {watchlist.map((symbol) => (
            <Badge key={symbol} variant="outline" className="flex items-center gap-2 bg-muted/40 px-3 py-1">
              <span className="tracking-[0.3em] text-xs font-semibold">{symbol}</span>
              <button
                type="button"
                onClick={() => handleRemoveSymbol(symbol)}
                className="rounded-full bg-muted/70 p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isWatchlistLoading && (
            <div className="col-span-full flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Streaming latest quotes…
            </div>
          )}

          {!isWatchlistLoading && watchlistQuotes.length > 0 &&
            watchlistQuotes.map((quote) => <WatchlistCard key={`${quote.symbol}-${quote.updatedAt}`} quote={quote} />)}

          {!isWatchlistLoading && watchlistQuotes.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
              Add a ticker above to start tracking live market data.
            </div>
          )}
        </div>

        {watchlistResponse && (
          <p className="text-[0.7rem] text-muted-foreground">
            Source: {watchlistResponse.source}
            {watchlistResponse.usedFallbackSource ? ' • Web scraping fallback active due to API limits.' : ''}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MoversList title="Top gainers" response={gainersResponse} isLoading={gainersLoading} />
        <MoversList title="Top losers" response={losersResponse} isLoading={losersLoading} />
        <MoversList title="Most active" response={activesResponse} isLoading={activesLoading} />
      </div>
    </section>
  );
};

export default PrismFinanceDashboard;
