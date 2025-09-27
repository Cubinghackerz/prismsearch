import React from 'react';
import { ArrowDownRight, ArrowUpRight, CircleDot, Clock3 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { FinanceCommandResult } from '@/context/ChatContext';
import MathRenderer from '@/components/math-assistant/MathRenderer';

interface FinanceCommandBubbleProps {
  summary: string;
  result: FinanceCommandResult;
}

const formatNumber = (value?: number, options: Intl.NumberFormatOptions = {}) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', options).format(value);
};

const FinanceCommandBubble: React.FC<FinanceCommandBubbleProps> = ({ summary, result }) => {
  const updatedLabel = formatDistanceToNow(new Date(result.fetchedAt), { addSuffix: true });

  return (
    <div className="space-y-4">
      <MathRenderer content={summary} className="text-sm leading-relaxed text-foreground/90" />

      <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CircleDot className="h-4 w-4 text-primary" />
            Live quote snapshot
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            <span>
              Updated {updatedLabel} • {format(new Date(result.fetchedAt), 'HH:mm:ss xxx')}
            </span>
          </div>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
          {result.quotes.map((quote) => {
            const isUp = quote.change >= 0;
            const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
            const trendColor = isUp ? 'text-emerald-500' : 'text-rose-500';

            return (
              <div
                key={`${quote.symbol}-${quote.updatedAt}`}
                className="rounded-xl border border-border/50 bg-card/40 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground tracking-wide">{quote.symbol}</div>
                    <div className="text-xs text-muted-foreground/90">{quote.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      ${formatNumber(quote.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-xs font-medium ${trendColor}`}>
                      <TrendIcon className="h-3.5 w-3.5" />
                      <span>
                        {quote.change >= 0 ? '+' : ''}
                        {formatNumber(quote.change, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="opacity-80">
                        ({quote.changePercent >= 0 ? '+' : ''}
                        {formatNumber(quote.changePercent, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.65rem] text-muted-foreground/90">
                  <div>
                    <dt className="uppercase tracking-wide">Volume</dt>
                    <dd className="font-medium text-foreground/90">
                      {formatNumber(quote.volume, { notation: 'compact', maximumFractionDigits: 1 })}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Market Cap</dt>
                    <dd className="font-medium text-foreground/90">
                      {formatNumber(quote.marketCap, { notation: 'compact', maximumFractionDigits: 1 })}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Day Range</dt>
                    <dd className="font-medium text-foreground/90">
                      {formatNumber(quote.dayLow, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} –
                      {" "}
                      {formatNumber(quote.dayHigh, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Prev Close</dt>
                    <dd className="font-medium text-foreground/90">
                      {formatNumber(quote.previousClose, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <span>{result.note ?? 'Data provided for informational purposes only.'}</span>
          <span className="font-medium">Source: {result.source}</span>
        </div>
      </div>
    </div>
  );
};

export default FinanceCommandBubble;
