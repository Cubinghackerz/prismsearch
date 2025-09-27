import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import { fetchHistoricalSeries, type HistoricalRange } from '@/services/financeService';
import { format } from 'date-fns';
import { formatCompactNumber, formatCurrency, formatPercent } from './utils';

const RANGE_OPTIONS: { label: string; value: HistoricalRange }[] = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1Y', value: '1Y' },
];

interface StockTrendCardProps {
  symbol: string;
  companyName: string;
}

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(142, 70%, 45%)',
  },
  volume: {
    label: 'Volume',
    color: 'hsl(215, 70%, 55%)',
  },
};

const getAxisFormatter = (range: HistoricalRange) => {
  if (range === '1D') {
    return (value: string) => format(new Date(value), 'p');
  }

  if (range === '5D') {
    return (value: string) => format(new Date(value), 'MMM d');
  }

  if (range === '1Y') {
    return (value: string) => format(new Date(value), 'MMM yy');
  }

  return (value: string) => format(new Date(value), 'MMM d');
};

const getTooltipLabel = (range: HistoricalRange, value: string) => {
  if (range === '1D') {
    return format(new Date(value), 'MMM d, yyyy • p');
  }

  return format(new Date(value), 'MMM d, yyyy');
};

const StockTrendCard: React.FC<StockTrendCardProps> = ({ symbol, companyName }) => {
  const [range, setRange] = React.useState<HistoricalRange>('1M');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['finance', 'historical', symbol, range],
    queryFn: () => fetchHistoricalSeries(symbol, range),
    keepPreviousData: true,
  });

  const chartData = React.useMemo(
    () =>
      data?.points.map((point) => ({
        time: point.time,
        price: point.close,
        volume: point.volume ?? 0,
      })) ?? [],
    [data],
  );

  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];

  const priceChange = React.useMemo(() => {
    if (!firstPoint || !lastPoint) {
      return { absolute: 0, percent: 0 };
    }

    const absolute = lastPoint.price - firstPoint.price;
    const percent = firstPoint.price === 0 ? 0 : (absolute / firstPoint.price) * 100;
    return { absolute, percent };
  }, [firstPoint, lastPoint]);

  const axisFormatter = React.useMemo(() => getAxisFormatter(range), [range]);

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {symbol} trend explorer
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Performance for {companyName}. Data provided by Polygon.io (US equities only).
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map(({ label, value }) => (
              <Button
                key={value}
                variant={value === range ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setRange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant={priceChange.absolute >= 0 ? 'default' : 'destructive'} className="rounded-full px-3 text-[0.7rem]">
            {priceChange.absolute >= 0 ? '▲' : '▼'} {formatCurrency(priceChange.absolute)} ({formatPercent(priceChange.percent)})
          </Badge>
          {data && (
            <span>Updated {format(new Date(data.fetchedAt), 'MMM d, yyyy p')}</span>
          )}
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading historical data…
          </div>
        )}
        {!isLoading && chartData.length === 0 && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Historical data unavailable for this range.
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <ComposedChart data={chartData} margin={{ left: 16, right: 16, top: 24, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => axisFormatter(value as string)}
                minTickGap={16}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                yAxisId="price"
                orientation="left"
                width={72}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => formatCurrency(value as number)}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                hide
                tickFormatter={(value) => formatCompactNumber(value as number)}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'var(--border)' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => getTooltipLabel(range, label as string)}
                    formatter={(value, name) => {
                      if (name === 'price') {
                        return [formatCurrency(value as number), 'Price'];
                      }
                      if (name === 'volume') {
                        return [formatCompactNumber(value as number), 'Volume'];
                      }
                      return [String(value), name];
                    }}
                  />
                }
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                fill="var(--color-price)"
                fillOpacity={0.15}
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Bar yAxisId="volume" dataKey="volume" fill="var(--color-volume)" opacity={0.25} barSize={14} />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StockTrendCard;
