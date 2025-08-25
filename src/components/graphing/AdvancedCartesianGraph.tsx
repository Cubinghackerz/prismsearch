
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Settings, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface EquationData {
  id: string;
  equation: string;
  color: string;
  visible: boolean;
  type: 'explicit' | 'implicit' | 'parametric' | 'inequality' | 'polar';
  style: 'solid' | 'dashed' | 'dotted';
  parameters?: Array<{
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
  }>;
}

interface AdvancedCartesianGraphProps {
  equations: EquationData[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width?: number;
  height?: number;
  onEquationUpdate: (id: string, updates: Partial<EquationData>) => void;
}

const AdvancedCartesianGraph: React.FC<AdvancedCartesianGraphProps> = ({
  equations,
  xMin,
  xMax,
  yMin,
  yMax,
  width = 800,
  height = 600,
  onEquationUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { width: canvasWidth, height: canvasHeight } = canvas;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    // Calculate grid spacing
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 10)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 10)));
    
    // Draw vertical grid lines
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const canvasX = ((x - xMin) / xRange) * canvasWidth;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, canvasHeight);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const canvasY = canvasHeight - ((y - yMin) / yRange) * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(canvasWidth, canvasY);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { width: canvasWidth, height: canvasHeight } = canvas;
    
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const yZero = canvasHeight - ((-yMin) / (yMax - yMin)) * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(canvasWidth, yZero);
      ctx.stroke();
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const xZero = ((-xMin) / (xMax - xMin)) * canvasWidth;
      ctx.beginPath();
      ctx.moveTo(xZero, 0);
      ctx.lineTo(xZero, canvasHeight);
      ctx.stroke();
    }
  };

  const evaluateEquation = (equation: string, x: number, parameters?: any): number => {
    try {
      // Replace parameters
      let expr = equation;
      if (parameters) {
        parameters.forEach((param: any) => {
          const regex = new RegExp(`\\b${param.name}\\b`, 'g');
          expr = expr.replace(regex, param.value.toString());
        });
      }
      
      // Replace mathematical functions and constants
      expr = expr.replace(/\bsin\b/g, 'Math.sin');
      expr = expr.replace(/\bcos\b/g, 'Math.cos');
      expr = expr.replace(/\btan\b/g, 'Math.tan');
      expr = expr.replace(/\bln\b/g, 'Math.log');
      expr = expr.replace(/\blog\b/g, 'Math.log10');
      expr = expr.replace(/\bsqrt\b/g, 'Math.sqrt');
      expr = expr.replace(/\be\b/g, 'Math.E');
      expr = expr.replace(/\bpi\b/g, 'Math.PI');
      expr = expr.replace(/\^/g, '**');
      expr = expr.replace(/\bx\b/g, x.toString());
      
      return eval(expr);
    } catch (error) {
      return NaN;
    }
  };

  const drawEquation = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, eq: EquationData) => {
    if (!eq.visible) return;
    
    const { width: canvasWidth, height: canvasHeight } = canvas;
    
    ctx.strokeStyle = eq.color;
    ctx.lineWidth = 2;
    
    if (eq.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (eq.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.beginPath();
    
    const step = (xMax - xMin) / canvasWidth;
    let started = false;
    
    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateEquation(eq.equation, x, eq.parameters);
      
      if (!isNaN(y) && isFinite(y)) {
        const canvasX = ((x - xMin) / (xMax - xMin)) * canvasWidth;
        const canvasY = canvasHeight - ((y - yMin) / (yMax - yMin)) * canvasHeight;
        
        if (!started) {
          ctx.moveTo(canvasX, canvasY);
          started = true;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      } else if (started) {
        ctx.stroke();
        ctx.beginPath();
        started = false;
      }
    }
    
    if (started) {
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawGrid(ctx, canvas);
    
    // Draw axes
    drawAxes(ctx, canvas);
    
    // Draw equations
    equations.forEach(eq => drawEquation(ctx, canvas, eq));
    
    // Draw coordinate display
    if (mousePos) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(`(${mousePos.x.toFixed(2)}, ${mousePos.y.toFixed(2)})`, 10, 20);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const mathX = xMin + (canvasX / width) * (xMax - xMin);
    const mathY = yMax - (canvasY / height) * (yMax - yMin);
    
    setMousePos({ x: mathX, y: mathY });
  };

  useEffect(() => {
    redraw();
  }, [equations, xMin, xMax, yMin, yMax, width, height]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive Graph</span>
          <Badge variant="secondary">Advanced</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            className="border border-border rounded-lg cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {/* Parameter Controls */}
          {equations.map((eq) => (
            eq.parameters && eq.visible && (
              <div key={eq.id} className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: eq.color }}
                  />
                  <span className="font-mono text-sm">{eq.equation}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEquationUpdate(eq.id, { visible: !eq.visible })}
                  >
                    {eq.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eq.parameters.map((param, index) => (
                    <div key={param.name} className="space-y-2">
                      <Label className="text-sm font-mono">
                        {param.name} = {param.value.toFixed(2)}
                      </Label>
                      <Slider
                        value={[param.value]}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        onValueChange={([value]) => {
                          const updatedParams = [...(eq.parameters || [])];
                          updatedParams[index] = { ...param, value };
                          onEquationUpdate(eq.id, { parameters: updatedParams });
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCartesianGraph;
