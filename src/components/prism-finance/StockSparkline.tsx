import React from 'react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { PricePoint } from '@/services/financeService';
import { format } from 'date-fns';
import { formatCurrency } from './utils';

interface StockSparklineProps {
  history?: PricePoint[];
  isPositive: boolean;
  symbol: string;
}

const buildChartData = (history?: PricePoint[]) => {
  if (!history || history.length === 0) {
    return [];
  }

  return history.slice(-60).map((point) => ({
    time: point.time,
    value: point.close,
  }));
};

const StockSparkline: React.FC<StockSparklineProps> = ({ history, isPositive, symbol }) => {
  const chartData = React.useMemo(() => buildChartData(history), [history]);
  const chartId = React.useId().replace(/:/g, '');

  if (!chartData.length) {
    return (
      <div className="text-xs text-muted-foreground">No recent trend data.</div>
    );
  }

  const color = isPositive ? 'hsl(142, 70%, 45%)' : 'hsl(350, 70%, 55%)';

  return (
    <ChartContainer
      config={{ value: { label: `${symbol} trend`, color } }}
      className="h-20 w-full"
    >
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <XAxis hide dataKey="time" />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#spark-${chartId})`}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: '3 3', stroke: 'var(--border)' }}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => [formatCurrency(value as number), symbol]}
              labelFormatter={(label) =>
                format(new Date(label as string), 'MMM d, yyyy p')
              }
            />
          }
        />
      </AreaChart>
    </ChartContainer>
  );
};

export default StockSparkline;
