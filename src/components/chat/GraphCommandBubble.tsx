import React, { useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/math-assistant/MathRenderer';
import { GraphCommandResult } from '@/services/graphingService';
import { Download, FileDown, Maximize2, Minimize2 } from 'lucide-react';

interface GraphCommandBubbleProps {
  summary: string;
  result: GraphCommandResult;
}

interface ChartEntry {
  x: number;
  [seriesKey: string]: number | null;
}

const GraphCommandBubble: React.FC<GraphCommandBubbleProps> = ({ summary, result }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const sampleCount = result.series[0]?.points.length ?? 0;

  const chartData: ChartEntry[] = useMemo(() => {
    if (!result.series.length) {
      return [];
    }

    const length = result.series[0].points.length;
    return Array.from({ length }, (_, index) => {
      const entry: ChartEntry = { x: result.series[0].points[index]?.x ?? 0 };

      result.series.forEach((series, seriesIndex) => {
        entry[`series-${seriesIndex}`] = series.points[index]?.y ?? null;
      });

      return entry;
    });
  }, [result.series]);

  const planeStyles = useMemo(
    () => ({
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      backgroundImage:
        'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      borderRadius: '0.75rem',
    }),
    []
  );

  const axisColor = '#ffffff';
  const gridColor = 'rgba(255, 255, 255, 0.24)';

  const handleExportSVG = () => {
    const container = chartContainerRef.current;
    if (!container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const clonedSvg = svg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(clonedSvg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `prism-graph-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!chartData.length) {
      return;
    }

    const headers = ['x', ...result.series.map((series) => series.label.replace(/,/g, ';'))];
    const rows = chartData.map((row) => {
      const values = [row.x.toFixed(6)];

      result.series.forEach((series, seriesIndex) => {
        const key = `series-${seriesIndex}`;
        const value = row[key];
        values.push(value == null || Number.isNaN(value) ? '' : Number(value).toFixed(6));
      });

      return values.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `prism-graph-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tooltipFormatter = (value: number | null, key: string) => {
    if (value == null || Number.isNaN(value)) {
      return ['—', result.series[0]?.label ?? key];
    }

    const index = Number.parseInt(key.replace('series-', ''), 10);
    const label = result.series[index]?.label ?? key;
    return [value.toFixed(6), label];
  };

  const legendFormatter = (value: string) => {
    const index = Number.parseInt(value.replace('series-', ''), 10);
    return result.series[index]?.label ?? value;
  };

  return (
    <div className="space-y-4">
      <MathRenderer content={summary} className="text-sm leading-relaxed text-foreground/90" />

      <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
            <div className="text-sm font-semibold text-foreground">Interactive equation plots</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Domain: [{result.xMin.toFixed(2)}, {result.xMax.toFixed(2)}] • Resolution: {sampleCount.toLocaleString()} samples
              </span>
            </div>
          </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {result.series.map((series) => (
              <span
                key={series.id}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="font-medium text-foreground/90">{series.label}</span>
                <span className="text-muted-foreground">{series.validPointCount} pts</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportSVG} className="gap-2">
              <Download className="h-4 w-4" /> Export SVG
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-2">
              <FileDown className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="gap-2"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        <div
          ref={chartContainerRef}
          className={`transition-all ${isExpanded ? 'h-[480px]' : 'h-[320px]'} px-4 py-4`}
          style={planeStyles}
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, left: 10, right: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="0" stroke={gridColor} opacity={0.7} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[result.xMin, result.xMax]}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                  stroke={axisColor}
                  tick={{ fill: axisColor }}
                  tickLine={{ stroke: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <YAxis
                  tickFormatter={(value) => Number(value).toFixed(2)}
                  stroke={axisColor}
                  tick={{ fill: axisColor }}
                  tickLine={{ stroke: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={(value) => `x = ${Number(value).toFixed(4)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.24)',
                    color: axisColor,
                  }}
                  itemStyle={{ color: axisColor }}
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.35)' }}
                />
                <Legend
                  formatter={legendFormatter}
                  wrapperStyle={{ color: axisColor }}
                  iconType="plainline"
                />
                <ReferenceLine x={0} stroke={axisColor} strokeWidth={1.5} />
                <ReferenceLine y={0} stroke={axisColor} strokeWidth={1.5} />
                {result.series.map((series, index) => (
                  <Line
                    key={series.id}
                    type="monotone"
                    dataKey={`series-${index}`}
                    name={series.label}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Unable to render chart data for the requested equations.
            </div>
          )}
        </div>

        {result.notes.length > 0 && (
          <div className="border-t border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">Notes</div>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {result.notes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphCommandBubble;
