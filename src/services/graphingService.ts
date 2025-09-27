import { create, all } from 'mathjs';

const math = create(all, { number: 'number', precision: 14 });

export interface GraphPoint {
  x: number;
  y: number | null;
}

export interface GraphSeries {
  id: string;
  expression: string;
  label: string;
  color: string;
  points: GraphPoint[];
  validPointCount: number;
}

export interface GraphCommandResult {
  xMin: number;
  xMax: number;
  step: number;
  series: GraphSeries[];
  notes: string[];
}

export interface GraphCommandComputation {
  result: GraphCommandResult;
  summaryLines: string[];
}

const COLOR_PALETTE = [
  '#2563eb',
  '#db2777',
  '#f97316',
  '#10b981',
  '#8b5cf6',
  '#14b8a6',
  '#facc15',
  '#ef4444',
];

const clampRange = (min: number, max: number): [number, number] => {
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return [-10, 10];
  }

  if (min === max) {
    return [min - 5, max + 5];
  }

  if (min > max) {
    return [max, min];
  }

  const span = Math.abs(max - min);
  if (span < 1e-6) {
    return [min - 5, min + 5];
  }

  return [min, max];
};

const sanitizeExpression = (expression: string): string => {
  let cleaned = expression.trim();

  cleaned = cleaned.replace(/^y\s*=\s*/i, '');
  cleaned = cleaned.replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '');
  cleaned = cleaned.replace(/^g\s*\(\s*x\s*\)\s*=\s*/i, '');

  if (/=/.test(cleaned)) {
    const [, rhs] = cleaned.split('=');
    if (rhs) {
      cleaned = rhs.trim();
    }
  }

  return cleaned;
};

const parseRangeFromToken = (token: string): [number, number] | null => {
  const patterns: RegExp[] = [
    /x\s*(?:from|between|in|∈)\s*(-?\d+(?:\.\d+)?)\s*(?:to|,|and)\s*(-?\d+(?:\.\d+)?)/i,
    /(-?\d+(?:\.\d+)?)\s*<=?\s*x\s*<=?\s*(-?\d+(?:\.\d+)?)/i,
    /domain\s*\[?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]?/i,
    /range\s*\[?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]?/i,
  ];

  for (const pattern of patterns) {
    const match = token.match(pattern);
    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        return clampRange(min, max);
      }
    }
  }

  return null;
};

const parseStepFromToken = (token: string): number | null => {
  const stepMatch = token.match(/step\s*(-?\d+(?:\.\d+)?)/i);
  if (stepMatch) {
    const value = Math.abs(parseFloat(stepMatch[1]));
    if (!Number.isNaN(value) && value > 0) {
      return value;
    }
  }

  const resolutionMatch = token.match(/(?:samples|points|resolution)\s*(\d{2,4})/i);
  if (resolutionMatch) {
    const count = parseInt(resolutionMatch[1], 10);
    if (!Number.isNaN(count) && count >= 20 && count <= 4000) {
      const span = 20;
      return span / (count - 1);
    }
  }

  return null;
};

export const computeGraphCommand = (rawInput: string): GraphCommandComputation => {
  const input = rawInput.replace(/\r/g, '').trim();

  if (!input) {
    throw new Error('Please provide at least one equation to graph.');
  }

  let xMin = -10;
  let xMax = 10;
  let step = 0.1;
  const notes: string[] = [];

  const tokens = input.split(/\n|;/).map((token) => token.trim()).filter(Boolean);
  const expressionTokens: string[] = [];

  tokens.forEach((token) => {
    const range = parseRangeFromToken(token);
    if (range) {
      [xMin, xMax] = range;
      return;
    }

    const parsedStep = parseStepFromToken(token);
    if (parsedStep) {
      step = parsedStep;
      return;
    }

    expressionTokens.push(token);
  });

  const cleanedExpressions = expressionTokens
    .map((expr) => expr.replace(/(?:for|where)\s+x\s*(?:=|in|between|from).*/i, '').trim())
    .filter(Boolean);

  if (cleanedExpressions.length === 0) {
    throw new Error('No valid equations were detected. Try formats like "y = sin(x)" or "f(x) = x^2".');
  }

  const [rangeMin, rangeMax] = clampRange(xMin, xMax);
  xMin = rangeMin;
  xMax = rangeMax;

  const maxSamples = 2000;
  const span = Math.abs(xMax - xMin);
  const derivedSamples = Math.min(Math.max(Math.floor(span / step) + 1, 200), maxSamples);
  step = span / Math.max(derivedSamples - 1, 1);

  const series: GraphSeries[] = [];
  const summaryLines: string[] = [];

  const xValues: number[] = Array.from({ length: derivedSamples }, (_, index) => Number((xMin + index * step).toFixed(6)));

  cleanedExpressions.forEach((expression, index) => {
    const sanitized = sanitizeExpression(expression);
    if (!sanitized) {
      notes.push(`Skipped empty expression near "${expression}".`);
      return;
    }

    let compiled;
    try {
      compiled = math.compile(sanitized);
    } catch (error) {
      notes.push(`Could not parse "${expression}".`);
      return;
    }

    const points: GraphPoint[] = xValues.map((x) => {
      try {
        const evaluated = compiled.evaluate({ x });
        if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
          return { x, y: Number(evaluated.toFixed(6)) };
        }
      } catch (error) {
        // Swallow evaluation errors and mark as null
      }
      return { x, y: null };
    });

    const validPointCount = points.filter((point) => typeof point.y === 'number').length;

    if (validPointCount === 0) {
      notes.push(`No real-valued points found for "${expression}" within the selected range.`);
      return;
    }

    series.push({
      id: `graph-series-${index}`,
      expression,
      label: expression,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      points,
      validPointCount,
    });

    summaryLines.push(`• ${expression} — ${validPointCount} plotted points`);
  });

  if (series.length === 0) {
    throw new Error('Unable to plot the provided equations. Try adjusting the expressions or domain.');
  }

  const result: GraphCommandResult = {
    xMin,
    xMax,
    step,
    series,
    notes,
  };

  return {
    result,
    summaryLines,
  };
};

