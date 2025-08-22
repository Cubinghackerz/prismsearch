
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CartesianGraphProps {
  equations: Array<{
    id: string;
    equation: string;
    color: string;
    visible: boolean;
  }>;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width?: number;
  height?: number;
}

const CartesianGraph: React.FC<CartesianGraphProps> = ({
  equations,
  xMin,
  xMax,
  yMin,
  yMax,
  width = 800,
  height = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const evaluateEquation = (expr: string, x: number): number | null => {
    try {
      let processedExpr = expr
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/e\^/g, 'Math.E**')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/x/g, x.toString());

      // Handle implicit multiplication
      processedExpr = processedExpr.replace(/(\d)([a-zA-Z])/g, '$1*$2');
      processedExpr = processedExpr.replace(/([a-zA-Z])(\d)/g, '$1*$2');

      const result = Function('"use strict"; return (' + processedExpr + ')')();
      return isNaN(result) || !isFinite(result) ? null : result;
    } catch (error) {
      return null;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate scales
    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);

    // Convert mathematical coordinates to canvas coordinates
    const toCanvasX = (x: number) => (x - xMin) * xScale;
    const toCanvasY = (y: number) => height - (y - yMin) * yScale;

    // Draw grid
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    const xStep = Math.pow(10, Math.floor(Math.log10((xMax - xMin) / 10)));
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStep = Math.pow(10, Math.floor(Math.log10((yMax - yMin) / 10)));
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const yAxisY = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, yAxisY);
      ctx.lineTo(width, yAxisY);
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const xAxisX = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(xAxisX, 0);
      ctx.lineTo(xAxisX, height);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#666666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep / 10) continue; // Skip zero
      const canvasX = toCanvasX(x);
      const labelY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 15 : height - 5;
      ctx.fillText(x.toString(), canvasX, labelY);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep / 10) continue; // Skip zero
      const canvasY = toCanvasY(y);
      const labelX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) - 5 : width - 5;
      ctx.fillText(y.toString(), labelX, canvasY + 4);
    }

    // Draw origin label
    if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
      ctx.textAlign = 'right';
      ctx.fillText('0', toCanvasX(0) - 5, toCanvasY(0) + 15);
    }

    // Draw equations
    equations.filter(eq => eq.visible).forEach((eq) => {
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = (xMax - xMin) / (width * 2);
      let isFirstPoint = true;

      for (let x = xMin; x <= xMax; x += step) {
        const y = evaluateEquation(eq.equation, x);
        
        if (y !== null && y >= yMin && y <= yMax) {
          const canvasX = toCanvasX(x);
          const canvasY = toCanvasY(y);

          if (isFirstPoint) {
            ctx.moveTo(canvasX, canvasY);
            isFirstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        } else {
          isFirstPoint = true;
        }
      }

      ctx.stroke();
    });
  };

  useEffect(() => {
    drawGraph();
  }, [equations, xMin, xMax, yMin, yMax, width, height]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cartesian Graph</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-border rounded-lg shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </CardContent>
    </Card>
  );
};

export default CartesianGraph;
