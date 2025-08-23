
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, X, Target, Move, ZoomIn, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface EquationData {
  id: string;
  equation: string;
  color: string;
  visible: boolean;
  type: 'explicit' | 'implicit' | 'parametric' | 'inequality' | 'polar';
  style: 'solid' | 'dashed' | 'dotted';
  parameters?: Parameter[];
}

interface AdvancedCartesianGraphProps {
  equations: EquationData[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width?: number;
  height?: number;
  onEquationUpdate?: (id: string, updates: Partial<EquationData>) => void;
  onPointClick?: (point: Point) => void;
}

const AdvancedCartesianGraph: React.FC<AdvancedCartesianGraphProps> = ({
  equations,
  xMin,
  xMax,
  yMin,
  yMax,
  width = 800,
  height = 600,
  onEquationUpdate,
  onPointClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [intersections, setIntersections] = useState<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [viewTransform, setViewTransform] = useState({ offsetX: 0, offsetY: 0, scale: 1 });

  const evaluateExpression = useCallback((expr: string, x: number, params: { [key: string]: number } = {}): number | null => {
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
        .replace(/\be\b/g, 'Math.E')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/x/g, x.toString());

      // Replace parameters
      Object.entries(params).forEach(([name, value]) => {
        processedExpr = processedExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), value.toString());
      });

      // Handle implicit multiplication
      processedExpr = processedExpr.replace(/(\d)([a-zA-Z])/g, '$1*$2');
      processedExpr = processedExpr.replace(/([a-zA-Z])(\d)/g, '$1*$2');

      const result = Function('"use strict"; return (' + processedExpr + ')')();
      return isNaN(result) || !isFinite(result) ? null : result;
    } catch (error) {
      return null;
    }
  }, []);

  const detectLinearEquation = useCallback((equation: string) => {
    // Detect if equation is linear and extract slope/intercept
    const slopeInterceptMatch = equation.match(/y\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d+\.?\d*)?/);
    const standardFormMatch = equation.match(/(-?\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d*\.?\d*)\s*\*?\s*y\s*=\s*(-?\d+\.?\d*)/);
    
    if (slopeInterceptMatch) {
      const slope = parseFloat(slopeInterceptMatch[1] || '1');
      const intercept = parseFloat(slopeInterceptMatch[2]?.replace(/\s/g, '') || '0');
      return { type: 'slope-intercept', slope, intercept };
    }
    
    if (standardFormMatch) {
      const A = parseFloat(standardFormMatch[1] || '1');
      const B = parseFloat(standardFormMatch[2]?.replace(/\s/g, '') || '1');
      const C = parseFloat(standardFormMatch[3] || '0');
      return { type: 'standard', A, B, C };
    }
    
    return null;
  }, []);

  const findIntersections = useCallback((eq1: EquationData, eq2: EquationData): Point[] => {
    const intersections: Point[] = [];
    const step = (xMax - xMin) / (width * 4);
    
    for (let x = xMin; x <= xMax; x += step) {
      const params1 = eq1.parameters ? Object.fromEntries(eq1.parameters.map(p => [p.name, p.value])) : {};
      const params2 = eq2.parameters ? Object.fromEntries(eq2.parameters.map(p => [p.name, p.value])) : {};
      
      const y1 = evaluateExpression(eq1.equation.replace('y=', ''), x, params1);
      const y2 = evaluateExpression(eq2.equation.replace('y=', ''), x, params2);
      
      if (y1 !== null && y2 !== null && Math.abs(y1 - y2) < 0.1) {
        intersections.push({ x, y: y1 });
      }
    }
    
    return intersections;
  }, [evaluateExpression, xMin, xMax, yMin, yMax, width]);

  const toCanvasCoords = useCallback((mathX: number, mathY: number): Point => {
    const adjustedXMin = xMin + viewTransform.offsetX;
    const adjustedXMax = xMax + viewTransform.offsetX;
    const adjustedYMin = yMin + viewTransform.offsetY;
    const adjustedYMax = yMax + viewTransform.offsetY;
    
    const xScale = (width / (adjustedXMax - adjustedXMin)) * viewTransform.scale;
    const yScale = (height / (adjustedYMax - adjustedYMin)) * viewTransform.scale;
    
    return {
      x: (mathX - adjustedXMin) * xScale,
      y: height - (mathY - adjustedYMin) * yScale
    };
  }, [xMin, xMax, yMin, yMax, width, height, viewTransform]);

  const toMathCoords = useCallback((canvasX: number, canvasY: number): Point => {
    const adjustedXMin = xMin + viewTransform.offsetX;
    const adjustedXMax = xMax + viewTransform.offsetX;
    const adjustedYMin = yMin + viewTransform.offsetY;
    const adjustedYMax = yMax + viewTransform.offsetY;
    
    const xScale = (width / (adjustedXMax - adjustedXMin)) * viewTransform.scale;
    const yScale = (height / (adjustedYMax - adjustedYMin)) * viewTransform.scale;
    
    return {
      x: canvasX / xScale + adjustedXMin,
      y: (height - canvasY) / yScale + adjustedYMin
    };
  }, [xMin, xMax, yMin, yMax, width, height, viewTransform]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.5;

    const adjustedXMin = xMin + viewTransform.offsetX;
    const adjustedXMax = xMax + viewTransform.offsetX;
    const adjustedYMin = yMin + viewTransform.offsetY;
    const adjustedYMax = yMax + viewTransform.offsetY;

    // Dynamic grid spacing
    const xRange = (adjustedXMax - adjustedXMin) / viewTransform.scale;
    const yRange = (adjustedYMax - adjustedYMin) / viewTransform.scale;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 10)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 10)));

    // Vertical grid lines
    for (let x = Math.ceil(adjustedXMin / xStep) * xStep; x <= adjustedXMax; x += xStep) {
      const canvasX = toCanvasCoords(x, 0).x;
      if (canvasX >= 0 && canvasX <= width) {
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
        ctx.stroke();
      }
    }

    // Horizontal grid lines
    for (let y = Math.ceil(adjustedYMin / yStep) * yStep; y <= adjustedYMax; y += yStep) {
      const canvasY = toCanvasCoords(0, y).y;
      if (canvasY >= 0 && canvasY <= height) {
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
        ctx.stroke();
      }
    }
  }, [xMin, xMax, yMin, yMax, width, height, viewTransform, toCanvasCoords]);

  const drawAxes = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;

    const origin = toCanvasCoords(0, 0);

    // X-axis
    if (origin.y >= 0 && origin.y <= height) {
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(width, origin.y);
      ctx.stroke();
    }

    // Y-axis
    if (origin.x >= 0 && origin.x <= width) {
      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, height);
      ctx.stroke();
    }
  }, [width, height, toCanvasCoords]);

  const drawLabels = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#666666';
    ctx.font = '12px monospace';

    const adjustedXMin = xMin + viewTransform.offsetX;
    const adjustedXMax = xMax + viewTransform.offsetX;
    const adjustedYMin = yMin + viewTransform.offsetY;
    const adjustedYMax = yMax + viewTransform.offsetY;

    const xRange = (adjustedXMax - adjustedXMin) / viewTransform.scale;
    const yRange = (adjustedYMax - adjustedYMin) / viewTransform.scale;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 10)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 10)));

    const origin = toCanvasCoords(0, 0);

    // X-axis labels
    ctx.textAlign = 'center';
    for (let x = Math.ceil(adjustedXMin / xStep) * xStep; x <= adjustedXMax; x += xStep) {
      if (Math.abs(x) < xStep / 10) continue;
      const canvasX = toCanvasCoords(x, 0).x;
      if (canvasX >= 0 && canvasX <= width) {
        const labelY = origin.y + 15;
        if (labelY <= height) {
          ctx.fillText(x.toFixed(x < 1 ? 1 : 0), canvasX, labelY);
        }
      }
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let y = Math.ceil(adjustedYMin / yStep) * yStep; y <= adjustedYMax; y += yStep) {
      if (Math.abs(y) < yStep / 10) continue;
      const canvasY = toCanvasCoords(0, y).y;
      if (canvasY >= 0 && canvasY <= height) {
        const labelX = origin.x - 5;
        if (labelX >= 0) {
          ctx.fillText(y.toFixed(y < 1 ? 1 : 0), labelX, canvasY + 4);
        }
      }
    }
  }, [xMin, xMax, yMin, yMax, viewTransform, toCanvasCoords, width, height]);

  const drawEquation = useCallback((ctx: CanvasRenderingContext2D, eq: EquationData) => {
    if (!eq.visible) return;

    ctx.strokeStyle = eq.color;
    ctx.lineWidth = 2;
    
    // Set line style
    if (eq.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (eq.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      ctx.setLineDash([]);
    }

    const params = eq.parameters ? Object.fromEntries(eq.parameters.map(p => [p.name, p.value])) : {};
    const adjustedXMin = xMin + viewTransform.offsetX;
    const adjustedXMax = xMax + viewTransform.offsetX;

    if (eq.type === 'explicit') {
      ctx.beginPath();
      const step = (adjustedXMax - adjustedXMin) / (width * 2);
      let isFirstPoint = true;

      for (let x = adjustedXMin; x <= adjustedXMax; x += step) {
        const y = evaluateExpression(eq.equation.replace('y=', ''), x, params);
        
        if (y !== null && y >= yMin + viewTransform.offsetY && y <= yMax + viewTransform.offsetY) {
          const canvasPoint = toCanvasCoords(x, y);
          
          if (isFirstPoint) {
            ctx.moveTo(canvasPoint.x, canvasPoint.y);
            isFirstPoint = false;
          } else {
            ctx.lineTo(canvasPoint.x, canvasPoint.y);
          }
        } else {
          isFirstPoint = true;
        }
      }
      ctx.stroke();

    } else if (eq.type === 'inequality') {
      // Handle inequality rendering with shading
      const step = (adjustedXMax - adjustedXMin) / (width / 2);
      ctx.fillStyle = eq.color + '20'; // Semi-transparent
      
      for (let x = adjustedXMin; x <= adjustedXMax; x += step) {
        const y = evaluateExpression(eq.equation.replace(/[><=]/g, '-').replace('y', ''), x, params);
        if (y !== null) {
          const canvasPoint = toCanvasCoords(x, y);
          const isAbove = eq.equation.includes('>');
          
          if (isAbove) {
            ctx.fillRect(canvasPoint.x, 0, step * (width / (adjustedXMax - adjustedXMin)), canvasPoint.y);
          } else {
            ctx.fillRect(canvasPoint.x, canvasPoint.y, step * (width / (adjustedXMax - adjustedXMin)), height - canvasPoint.y);
          }
        }
      }
    }

    ctx.setLineDash([]); // Reset line dash
  }, [evaluateExpression, xMin, xMax, yMin, yMax, viewTransform, toCanvasCoords, width]);

  const drawIntersections = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ff0000';
    intersections.forEach(point => {
      const canvasPoint = toCanvasCoords(point.x, point.y);
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [intersections, toCanvasCoords]);

  const drawHoveredPoint = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!hoveredPoint) return;
    
    const canvasPoint = toCanvasCoords(hoveredPoint.x, hoveredPoint.y);
    
    // Draw crosshair
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    ctx.beginPath();
    ctx.moveTo(0, canvasPoint.y);
    ctx.lineTo(width, canvasPoint.y);
    ctx.moveTo(canvasPoint.x, 0);
    ctx.lineTo(canvasPoint.x, height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw point
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw coordinates
    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    const label = `(${hoveredPoint.x.toFixed(2)}, ${hoveredPoint.y.toFixed(2)})`;
    ctx.fillText(label, canvasPoint.x + 10, canvasPoint.y - 10);
  }, [hoveredPoint, toCanvasCoords, width, height]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx);
    drawAxes(ctx);
    drawLabels(ctx);

    // Draw equations
    equations.forEach(eq => drawEquation(ctx, eq));

    drawIntersections(ctx);
    drawHoveredPoint(ctx);

    // Update intersections
    const newIntersections: Point[] = [];
    for (let i = 0; i < equations.length; i++) {
      for (let j = i + 1; j < equations.length; j++) {
        if (equations[i].visible && equations[j].visible && 
            equations[i].type === 'explicit' && equations[j].type === 'explicit') {
          newIntersections.push(...findIntersections(equations[i], equations[j]));
        }
      }
    }
    setIntersections(newIntersections);
  }, [equations, width, height, viewTransform, drawGrid, drawAxes, drawLabels, drawEquation, drawIntersections, drawHoveredPoint, findIntersections]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = canvasX - dragStart.x;
      const deltaY = canvasY - dragStart.y;
      
      setViewTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX - deltaX / (width / (xMax - xMin)),
        offsetY: prev.offsetY + deltaY / (height / (yMax - yMin))
      }));
      
      setDragStart({ x: canvasX, y: canvasY });
    } else {
      const mathPoint = toMathCoords(canvasX, canvasY);
      setHoveredPoint(mathPoint);
    }
  }, [isDragging, dragStart, toMathCoords, width, height, xMin, xMax, yMin, yMax]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: canvasX, y: canvasY });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setViewTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, prev.scale * scaleFactor))
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewTransform({ offsetX: 0, offsetY: 0, scale: 1 });
  }, []);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Advanced Graphing Tool</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{intersections.length} Intersections</Badge>
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-border rounded-lg shadow-sm cursor-move"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {hoveredPoint && (
          <div className="text-center text-sm text-muted-foreground">
            Coordinates: ({hoveredPoint.x.toFixed(3)}, {hoveredPoint.y.toFixed(3)})
          </div>
        )}

        {/* Parameter Controls */}
        {equations.some(eq => eq.parameters && eq.parameters.length > 0) && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Interactive Parameters</h3>
            {equations.filter(eq => eq.parameters && eq.parameters.length > 0).map(eq => (
              <div key={eq.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: eq.color }}
                  />
                  <span className="font-mono text-sm">{eq.equation}</span>
                </div>
                {eq.parameters?.map(param => (
                  <div key={param.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{param.name}</span>
                      <span>{param.value.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[param.value]}
                      onValueChange={(values) => {
                        if (onEquationUpdate) {
                          const updatedParams = eq.parameters?.map(p => 
                            p.name === param.name ? { ...p, value: values[0] } : p
                          );
                          onEquationUpdate(eq.id, { parameters: updatedParams });
                        }
                      }}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedCartesianGraph;
