import { create, all } from 'mathjs';

const math = create(all, { number: 'number', precision: 14 });

export interface Graph3DResult {
  xValues: number[];
  yValues: number[];
  zMatrix: (number | null)[][];
  expression: string;
  xRange: [number, number];
  yRange: [number, number];
  notes: string[];
}

export interface Graph3DComputation {
  result: Graph3DResult;
  summaryLines: string[];
}

const clampRange = (min: number, max: number, fallback: [number, number]): [number, number] => {
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return fallback;
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

  cleaned = cleaned.replace(/^z\s*=\s*/i, '');
  cleaned = cleaned.replace(/^f\s*\(\s*x\s*,\s*y\s*\)\s*=\s*/i, '');
  cleaned = cleaned.replace(/^g\s*\(\s*x\s*,\s*y\s*\)\s*=\s*/i, '');

  if (/=/.test(cleaned)) {
    const [, rhs] = cleaned.split('=');
    if (rhs) {
      cleaned = rhs.trim();
    }
  }

  return cleaned;
};

const parseRangeFromToken = (token: string, variable: 'x' | 'y'): [number, number] | null => {
  const patterns: RegExp[] = [
    new RegExp(`${variable}\\s*(?:from|between|in|∈)\\s*(-?\\d+(?:\\.\\d+)?)\\s*(?:to|,|and)\\s*(-?\\d+(?:\\.\\d+)?)`, 'i'),
    new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*<=?\\s*${variable}\\s*<=?\\s*(-?\\d+(?:\\.\\d+)?)`, 'i'),
    new RegExp(`${variable}\\s*domain\\s*\\[?\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\]?`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = token.match(pattern);
    if (match) {
      const min = Number.parseFloat(match[1]);
      const max = Number.parseFloat(match[2]);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        return clampRange(min, max, variable === 'x' ? [-8, 8] : [-8, 8]);
      }
    }
  }

  return null;
};

const parseResolution = (token: string): number | null => {
  const resolutionMatch = token.match(/(?:grid|resolution|samples)\\s*(\d{2,3})/i);
  if (resolutionMatch) {
    const count = Number.parseInt(resolutionMatch[1], 10);
    if (!Number.isNaN(count) && count >= 10 && count <= 80) {
      return count;
    }
  }

  return null;
};

const linspace = (min: number, max: number, count: number): number[] => {
  if (count <= 1) {
    return [min, max];
  }

  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => Number((min + index * step).toFixed(6)));
};

export const computeSurfaceGraph = (rawInput: string): Graph3DComputation => {
  const input = rawInput.replace(/\r/g, '').trim();

  if (!input) {
    throw new Error('Provide an expression to graph, e.g., "z = sin(x) * cos(y)".');
  }

  const defaultRange: [number, number] = [-6, 6];
  let xRange: [number, number] = [...defaultRange];
  let yRange: [number, number] = [...defaultRange];
  let resolution = 35;
  const notes: string[] = [];

  const tokens = input
    .split(/\n|;/)
    .map((token) => token.trim())
    .filter(Boolean);

  const expressions: string[] = [];

  tokens.forEach((token) => {
    const xParsed = parseRangeFromToken(token, 'x');
    if (xParsed) {
      xRange = xParsed;
      return;
    }

    const yParsed = parseRangeFromToken(token, 'y');
    if (yParsed) {
      yRange = yParsed;
      return;
    }

    const resolutionParsed = parseResolution(token);
    if (resolutionParsed) {
      resolution = resolutionParsed;
      return;
    }

    expressions.push(token);
  });

  const cleanedExpression = sanitizeExpression(expressions.join(' '));
  if (!cleanedExpression) {
    throw new Error('No valid surface expression detected. Try formats like "z = sin(x) * cos(y)".');
  }

  const [xMin, xMax] = clampRange(xRange[0], xRange[1], defaultRange);
  const [yMin, yMax] = clampRange(yRange[0], yRange[1], defaultRange);

  const xValues = linspace(xMin, xMax, resolution);
  const yValues = linspace(yMin, yMax, resolution);

  let compiled;
  try {
    compiled = math.compile(cleanedExpression);
  } catch (error) {
    throw new Error('Unable to parse the expression. Ensure it only uses x and y variables.');
  }

  const zMatrix: (number | null)[][] = [];
  let validCount = 0;

  yValues.forEach((y) => {
    const row: (number | null)[] = [];
    xValues.forEach((x) => {
      try {
        const evaluated = compiled.evaluate({ x, y });
        if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
          validCount += 1;
          row.push(Number(evaluated.toFixed(6)));
        } else {
          row.push(null);
        }
      } catch (error) {
        row.push(null);
      }
    });
    zMatrix.push(row);
  });

  if (validCount === 0) {
    throw new Error('The expression could not be evaluated on the requested grid. Try adjusting the range.');
  }

  const summaryLines = [
    `Plotted $$z = ${cleanedExpression.replace(/\*/g, '\\cdot ')}$$ over $$x \in [${xMin}, ${xMax}]$$ and $$y \in [${yMin}, ${yMax}]$$.`,
    `Resolution: ${resolution} × ${resolution} sample grid with ${validCount.toLocaleString()} valid points.`,
  ];

  if (notes.length) {
    summaryLines.push(...notes);
  }

  return {
    result: {
      expression: cleanedExpression,
      xValues,
      yValues,
      zMatrix,
      xRange: [xMin, xMax],
      yRange: [yMin, yMax],
      notes,
    },
    summaryLines,
  };
};
