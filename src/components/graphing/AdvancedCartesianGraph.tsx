import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Move, Crosshair } from 'lucide-react';
import { toast } from 'sonner';

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

interface GraphProps {
  equations: EquationData[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
  onEquationUpdate?: (id: string, updates: Partial<EquationData>) => void;
}

const AdvancedCartesianGraph: React.FC<GraphProps> = ({
  equations,
  xMin,
  xMax,
  yMin,
  yMax,
  width,
  height,
  onEquationUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewBounds, setViewBounds] = useState({ xMin, xMax, yMin, yMax });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [intersections, setIntersections] = useState<Array<{ x: number; y: number; equations: string[] }>>([]);

  const evaluateExpression = useCallback((expr: string, x: number, parameters?: any): number => {
    try {
      // Handle vertical lines (x = constant)
      if (expr.includes('x =') || expr.includes('x=')) {
        const match = expr.match(/x\s*=\s*([-+]?\d*\.?\d+)/);
        if (match) {
          const constantValue = parseFloat(match[1]);
          return Math.abs(x - constantValue) < 0.01 ? 0 : NaN;
        }
      }

      // Handle horizontal lines (y = constant)
      if (expr.match(/^[-+]?\d*\.?\d+$/)) {
        return parseFloat(expr);
      }

      // Start with the original expression
      let expression = expr;
      
      // Replace parameters first if provided
      if (parameters) {
        Object.entries(parameters).forEach(([param, value]) => {
          const regex = new RegExp(`\\b${param}\\b`, 'g');
          expression = expression.replace(regex, `(${value})`);
        });
      }
      
      // Replace mathematical constants and functions
      expression = expression
        .replace(/\^/g, '**')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b(?![a-zA-Z])/g, 'Math.E')
        .replace(/\bx\b/g, `(${x})`);

      // Handle implicit multiplication (e.g., 2x becomes 2*x)
      expression = expression
        .replace(/(\d+)\s*\(/g, '$1*(')
        .replace(/\)\s*(\d+)/g, ')*$1')
        .replace(/(\d+)\s*([a-zA-Z]+)/g, '$1*$2');

      const result = Function(`"use strict"; return (${expression})`)();
      return isNaN(result) || !isFinite(result) ? NaN : result;
    } catch (error) {
      console.error(`Error evaluating expression "${expr}":`, error);
      return NaN;
    }
  }, []);

  const evaluateImplicitEquation = useCallback((expr: string, x: number, y: number, parameters?: any): boolean => {
    try {
      let expression = expr;
      
      // Replace parameters first
      if (parameters) {
        Object.entries(parameters).forEach(([param, value]) => {
          const regex = new RegExp(`\\b${param}\\b`, 'g');
          expression = expression.replace(regex, `(${value})`);
        });
      }
      
      // Handle vertical lines (x = constant)
      if (expression.includes('x =') || expression.includes('x=')) {
        const match = expression.match(/x\s*=\s*([-+]?\d*\.?\d+)/);
        if (match) {
          const constantValue = parseFloat(match[1]);
          return Math.abs(x - constantValue) < 0.05;
        }
      }

      // Handle horizontal lines (y = constant)  
      if (expression.includes('y =') || expression.includes('y=')) {
        const match = expression.match(/y\s*=\s*([-+]?\d*\.?\d+)/);
        if (match) {
          const constantValue = parseFloat(match[1]);
          return Math.abs(y - constantValue) < 0.05;
        }
      }
      
      // Handle equations like "x^2 + y^2 = r^2"
      if (expression.includes('=')) {
        const [left, right] = expression.split('=');
        const leftResult = evaluateExpression(left.trim(), x, { y });
        const rightResult = evaluateExpression(right.trim(), x, { y });
        return Math.abs(leftResult - rightResult) < 0.1;
      }
      
      // Handle inequalities like "y > x^2"
      if (expression.includes('>')) {
        const [left, right] = expression.split('>');
        const leftResult = evaluateExpression(left.trim(), x, { y });
        const rightResult = evaluateExpression(right.trim(), x, { y });
        return leftResult > rightResult;
      }
      
      if (expression.includes('<')) {
        const [left, right] = expression.split('<');
        const leftResult = evaluateExpression(left.trim(), x, { y });
        const rightResult = evaluateExpression(right.trim(), x, { y });
        return leftResult < rightResult;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [evaluateExpression]);

  const screenToGraph = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / canvas.width) * (viewBounds.xMax - viewBounds.xMin) + viewBounds.xMin;
    const y = ((rect.bottom - screenY) / canvas.height) * (viewBounds.yMax - viewBounds.yMin) + viewBounds.yMin;
    return { x, y };
  }, [viewBounds]);

  const graphToScreen = useCallback((graphX: number, graphY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const x = ((graphX - viewBounds.xMin) / (viewBounds.xMax - viewBounds.xMin)) * canvas.width;
    const y = canvas.height - ((graphY - viewBounds.yMin) / (viewBounds.yMax - viewBounds.yMin)) * canvas.height;
    return { x, y };
  }, [viewBounds]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else {
          toast.error('Fullscreen not supported in this browser');
          return;
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Unable to toggle fullscreen mode');
    }
  };

  const resetView = () => {
    setViewBounds({ xMin, xMax, yMin, yMax });
  };

  const zoomIn = () => {
    const centerX = (viewBounds.xMin + viewBounds.xMax) / 2;
    const centerY = (viewBounds.yMin + viewBounds.yMax) / 2;
    const rangeX = (viewBounds.xMax - viewBounds.xMin) * 0.25;
    const rangeY = (viewBounds.yMax - viewBounds.yMin) * 0.25;
    
    setViewBounds({
      xMin: centerX - rangeX,
      xMax: centerX + rangeX,
      yMin: centerY - rangeY,
      yMax: centerY + rangeY
    });
  };

  const zoomOut = () => {
    const centerX = (viewBounds.xMin + viewBounds.xMax) / 2;
    const centerY = (viewBounds.yMin + viewBounds.yMax) / 2;
    const rangeX = (viewBounds.xMax - viewBounds.xMin);
    const rangeY = (viewBounds.yMax - viewBounds.yMin);
    
    setViewBounds({
      xMin: centerX - rangeX,
      xMax: centerX + rangeX,
      yMin: centerY - rangeY,
      yMax: centerY + rangeY
    });
  };

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const containerWidth = isFullscreen ? window.innerWidth : width;
    const containerHeight = isFullscreen ? window.innerHeight - 100 : height;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    const stepX = (viewBounds.xMax - viewBounds.xMin) / 20;
    const stepY = (viewBounds.yMax - viewBounds.yMin) / 20;
    
    for (let x = Math.ceil(viewBounds.xMin / stepX) * stepX; x <= viewBounds.xMax; x += stepX) {
      const screenX = graphToScreen(x, 0).x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }
    
    for (let y = Math.ceil(viewBounds.yMin / stepY) * stepY; y <= viewBounds.yMax; y += stepY) {
      const screenY = graphToScreen(0, y).y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    const originScreen = graphToScreen(0, 0);
    
    // X-axis
    if (viewBounds.yMin <= 0 && viewBounds.yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, originScreen.y);
      ctx.lineTo(canvas.width, originScreen.y);
      ctx.stroke();
    }
    
    // Y-axis
    if (viewBounds.xMin <= 0 && viewBounds.xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(originScreen.x, 0);
      ctx.lineTo(originScreen.x, canvas.height);
      ctx.stroke();
    }

    // Draw equations
    equations.forEach((eq) => {
      if (!eq.visible) return;

      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2;
      
      if (eq.style === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else if (eq.style === 'dotted') {
        ctx.setLineDash([2, 3]);
      } else {
        ctx.setLineDash([]);
      }

      const parameters = eq.parameters?.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {});

      // Handle vertical lines
      if (eq.equation.includes('x =') || eq.equation.includes('x=')) {
        const match = eq.equation.match(/x\s*=\s*([-+]?\d*\.?\d+)/);
        if (match) {
          const xValue = parseFloat(match[1]);
          const screenX = graphToScreen(xValue, 0).x;
          ctx.beginPath();
          ctx.moveTo(screenX, 0);
          ctx.lineTo(screenX, canvas.height);
          ctx.stroke();
          return;
        }
      }

      // Handle horizontal lines
      if (eq.equation.includes('y =') || eq.equation.includes('y=')) {
        const match = eq.equation.match(/y\s*=\s*([-+]?\d*\.?\d+)/);
        if (match) {
          const yValue = parseFloat(match[1]);
          const screenY = graphToScreen(0, yValue).y;
          ctx.beginPath();
          ctx.moveTo(0, screenY);
          ctx.lineTo(canvas.width, screenY);
          ctx.stroke();
          return;
        }
      }

      if (eq.type === 'explicit') {
        ctx.beginPath();
        let firstPoint = true;
        
        for (let screenX = 0; screenX <= canvas.width; screenX += 1) {
          const graphX = ((screenX / canvas.width) * (viewBounds.xMax - viewBounds.xMin)) + viewBounds.xMin;
          const y = evaluateExpression(eq.equation, graphX, parameters);
          
          if (!isNaN(y) && isFinite(y)) {
            const screenY = graphToScreen(graphX, y).y;
            if (screenY >= 0 && screenY <= canvas.height) {
              if (firstPoint) {
                ctx.moveTo(screenX, screenY);
                firstPoint = false;
              } else {
                ctx.lineTo(screenX, screenY);
              }
            } else {
              firstPoint = true;
            }
          } else {
            firstPoint = true;
          }
        }
        ctx.stroke();
      } else if (eq.type === 'implicit') {
        // For implicit equations like circles, ellipses
        ctx.fillStyle = eq.color + '40'; // Semi-transparent
        
        for (let screenX = 0; screenX < canvas.width; screenX += 2) {
          for (let screenY = 0; screenY < canvas.height; screenY += 2) {
            const graphCoords = screenToGraph(screenX, screenY);
            if (evaluateImplicitEquation(eq.equation, graphCoords.x, graphCoords.y, parameters)) {
              ctx.fillRect(screenX, screenY, 2, 2);
            }
          }
        }
      } else if (eq.type === 'inequality') {
        // For inequalities, fill the region
        ctx.fillStyle = eq.color + '40'; // Semi-transparent
        
        for (let screenX = 0; screenX < canvas.width; screenX += 3) {
          for (let screenY = 0; screenY < canvas.height; screenY += 3) {
            const graphCoords = screenToGraph(screenX, screenY);
            if (evaluateImplicitEquation(eq.equation, graphCoords.x, graphCoords.y, parameters)) {
              ctx.fillRect(screenX, screenY, 3, 3);
            }
          }
        }
      }
    });

    // Draw intersections
    ctx.fillStyle = '#ff0000';
    intersections.forEach(intersection => {
      const screen = graphToScreen(intersection.x, intersection.y);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw coordinates if mouse is over canvas
    if (showCoordinates) {
      const graphCoords = screenToGraph(mousePos.x, mousePos.y);
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillRect(mousePos.x + 10, mousePos.y - 30, 120, 25);
      ctx.fillStyle = '#000';
      ctx.fillText(`(${graphCoords.x.toFixed(2)}, ${graphCoords.y.toFixed(2)})`, mousePos.x + 15, mousePos.y - 10);
    }
  }, [equations, viewBounds, isFullscreen, width, height, mousePos, showCoordinates, intersections, evaluateExpression, evaluateImplicitEquation, graphToScreen, screenToGraph]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setLastMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setMousePos(currentPos);

    if (isDragging) {
      const deltaX = currentPos.x - lastMousePos.x;
      const deltaY = currentPos.y - lastMousePos.y;
      
      const graphDeltaX = -(deltaX / rect.width) * (viewBounds.xMax - viewBounds.xMin);
      const graphDeltaY = (deltaY / rect.height) * (viewBounds.yMax - viewBounds.yMin);
      
      setViewBounds(prev => ({
        xMin: prev.xMin + graphDeltaX,
        xMax: prev.xMax + graphDeltaX,
        yMin: prev.yMin + graphDeltaY,
        yMax: prev.yMax + graphDeltaY
      }));
      
      setLastMousePos(currentPos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const graphMouse = screenToGraph(mouseX, mouseY);
    
    const rangeX = viewBounds.xMax - viewBounds.xMin;
    const rangeY = viewBounds.yMax - viewBounds.yMin;
    const newRangeX = rangeX * zoomFactor;
    const newRangeY = rangeY * zoomFactor;
    
    setViewBounds({
      xMin: graphMouse.x - (graphMouse.x - viewBounds.xMin) * zoomFactor,
      xMax: graphMouse.x + (viewBounds.xMax - graphMouse.x) * zoomFactor,
      yMin: graphMouse.y - (graphMouse.y - viewBounds.yMin) * zoomFactor,
      yMax: graphMouse.y + (viewBounds.yMax - graphMouse.y) * zoomFactor
    });
  };

  // Update view bounds when props change
  useEffect(() => {
    setViewBounds({ xMin, xMax, yMin, yMax });
  }, [xMin, xMax, yMin, yMax]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}
    >
      <Card className={`${isFullscreen ? 'h-full border-0 rounded-none' : ''}`}>
        <CardContent className="p-4 h-full">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant={showCoordinates ? "default" : "outline"}
              onClick={() => setShowCoordinates(!showCoordinates)}
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2 ml-auto">
              <Badge variant="secondary">
                View: ({viewBounds.xMin.toFixed(1)}, {viewBounds.yMin.toFixed(1)}) to ({viewBounds.xMax.toFixed(1)}, {viewBounds.yMax.toFixed(1)})
              </Badge>
              {intersections.length > 0 && (
                <Badge variant="default">
                  {intersections.length} intersection{intersections.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="border border-border rounded cursor-move"
            width={isFullscreen ? window.innerWidth : width}
            height={isFullscreen ? window.innerHeight - 100 : height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDragging(false);
              setShowCoordinates(false);
            }}
            onMouseEnter={() => setShowCoordinates(true)}
            onWheel={handleWheel}
          />

          {/* Parameter Controls */}
          {equations.some(eq => eq.parameters && eq.visible) && (
            <div className="mt-4 space-y-4">
              <h4 className="font-semibold">Interactive Parameters</h4>
              {equations.filter(eq => eq.parameters && eq.visible).map(eq => (
                <div key={eq.id} className="space-y-2">
                  <h5 className="text-sm font-medium" style={{ color: eq.color }}>
                    {eq.equation}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eq.parameters?.map((param) => (
                      <div key={param.name} className="space-y-2">
                        <Label className="flex justify-between">
                          <span>{param.name}</span>
                          <span>{param.value.toFixed(2)}</span>
                        </Label>
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
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCartesianGraph;
