import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Maximize2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const AdvancedCartesianGraph = () => {
  const [functions, setFunctions] = useState<any[]>([]);
  const [newFunction, setNewFunction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState({ min: -10, max: 10 });
  const [range, setRange] = useState({ min: -10, max: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { toast } = useToast();

  const presets = [
    { 
      name: 'Linear', 
      functions: ['x', '2*x + 1', '-0.5*x + 3'], 
      colors: ['#00c2a8', '#4f46e5', '#f59e0b'],
      domain: { min: -10, max: 10 },
      range: { min: -10, max: 10 }
    },
    { 
      name: 'Quadratic', 
      functions: ['x^2', '-(x-2)^2 + 3', '0.5*x^2 - 2*x + 1'], 
      colors: ['#00c2a8', '#4f46e5', '#f59e0b'],
      domain: { min: -5, max: 5 },
      range: { min: -5, max: 10 }
    },
    { 
      name: 'Trigonometric', 
      functions: ['sin(x)', 'cos(x)', 'tan(x/2)'], 
      colors: ['#00c2a8', '#4f46e5', '#f59e0b'],
      domain: { min: -2*Math.PI, max: 2*Math.PI },
      range: { min: -3, max: 3 }
    },
    { 
      name: 'Exponential', 
      functions: ['exp(x)', 'exp(-x)', '2^x'], 
      colors: ['#00c2a8', '#4f46e5', '#f59e0b'],
      domain: { min: -3, max: 3 },
      range: { min: 0, max: 8 }
    },
    { 
      name: 'Vertical Line', 
      functions: ['x = 2'], 
      colors: ['#00c2a8'],
      domain: { min: -5, max: 5 },
      range: { min: -5, max: 5 },
      isVertical: true
    },
    { 
      name: 'Horizontal Line', 
      functions: ['y = 3'], 
      colors: ['#4f46e5'],
      domain: { min: -5, max: 5 },
      range: { min: -2, max: 8 },
      isHorizontal: true
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctxRef.current = ctx;
    drawGrid();
    functions.forEach(func => plotFunction(func.expression, func.color));
  }, [functions, domain, range]);

  const drawGrid = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set grid style
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    
    // Calculate grid spacing
    const gridSpacing = 40;
    
    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const centerX = canvas.width / 2 + panOffset.x;
    const centerY = canvas.height / 2 + panOffset.y;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();
    
    // Add axis labels with proper scaling
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    // X-axis labels
    const xStep = (domain.max - domain.min) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i + panOffset.x;
      const value = domain.min + (xStep * i);
      if (Math.abs(value) > 0.01 || value === 0) {
        ctx.fillText(value.toFixed(1), x, centerY + 20);
      }
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const yStep = (range.max - range.min) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = canvas.height - (canvas.height / 10) * i + panOffset.y;
      const value = range.min + (yStep * i);
      if (Math.abs(value) > 0.01 || value === 0) {
        ctx.fillText(value.toFixed(1), centerX - 10, y + 4);
      }
    }
  }, [domain, range, panOffset]);

  const plotFunction = useCallback((funcStr: string, color: string) => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    try {
      // Handle vertical lines (x = constant)
      if (funcStr.includes('x =')) {
        const xValue = parseFloat(funcStr.split('=')[1].trim());
        const canvasX = ((xValue - domain.min) / (domain.max - domain.min)) * canvas.width + panOffset.x;
        
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, canvas.height);
        ctx.stroke();
        return;
      }
      
      // Handle horizontal lines (y = constant)
      if (funcStr.includes('y =')) {
        const yValue = parseFloat(funcStr.split('=')[1].trim());
        const canvasY = canvas.height - ((yValue - range.min) / (range.max - range.min)) * canvas.height + panOffset.y;
        
        ctx.moveTo(0, canvasY);
        ctx.lineTo(canvas.width, canvasY);
        ctx.stroke();
        return;
      }
      
      // Regular function plotting
      let firstPoint = true;
      const step = (domain.max - domain.min) / canvas.width;
      
      for (let x = domain.min; x <= domain.max; x += step) {
        try {
          const y = evaluateFunction(funcStr, x);
          
          if (isFinite(y) && y >= range.min && y <= range.max) {
            const canvasX = ((x - domain.min) / (domain.max - domain.min)) * canvas.width + panOffset.x;
            const canvasY = canvas.height - ((y - range.min) / (range.max - range.min)) * canvas.height + panOffset.y;
            
            if (firstPoint) {
              ctx.moveTo(canvasX, canvasY);
              firstPoint = false;
            } else {
              ctx.lineTo(canvasX, canvasY);
            }
          } else if (!firstPoint) {
            // Break the line for discontinuities
            ctx.stroke();
            ctx.beginPath();
            firstPoint = true;
          }
        } catch (e) {
          // Skip invalid points
          if (!firstPoint) {
            ctx.stroke();
            ctx.beginPath();
            firstPoint = true;
          }
        }
      }
      
      ctx.stroke();
    } catch (error) {
      console.error('Error plotting function:', error);
    }
  }, [domain, range, panOffset]);

  const evaluateFunction = (funcStr: string, x: number): number => {
    // Replace math functions and constants
    funcStr = funcStr.replace(/Math\.PI/g, Math.PI.toString());
    funcStr = funcStr.replace(/Math\.E/g, Math.E.toString());
    funcStr = funcStr.replace(/sin\(/g, 'Math.sin(');
    funcStr = funcStr.replace(/cos\(/g, 'Math.cos(');
    funcStr = funcStr.replace(/tan\(/g, 'Math.tan(');
    funcStr = funcStr.replace(/exp\(/g, 'Math.exp(');
    funcStr = funcStr.replace(/sqrt\(/g, 'Math.sqrt(');
    funcStr = funcStr.replace(/log\(/g, 'Math.log(');
    funcStr = funcStr.replace(/abs\(/g, 'Math.abs(');
    funcStr = funcStr.replace(/\^/g, '**');
    
    // Use a Proxy to safely evaluate the function
    const sandbox = { x: x };
    const proxy = new Proxy(sandbox, {
      has: () => true,
      get: (target, prop) => {
        if (prop === 'x') {
          return target[prop];
        }
        if (typeof Math[prop] === 'function') {
          return Math[prop];
        }
        return undefined;
      }
    });
    
    try {
      const result = new Function('with (this) { return ' + funcStr + ' }').call(proxy);
      return Number(result);
    } catch (error) {
      console.error(`Error evaluating function ${funcStr}:`, error);
      return NaN;
    }
  };

  const addFunction = () => {
    if (!newFunction.trim()) return;
    
    const newFunc = {
      id: Date.now(),
      expression: newFunction,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      visible: true
    };
    
    setFunctions(prev => [...prev, newFunc]);
    setNewFunction('');
  };

  const removeFunction = (id: number) => {
    setFunctions(prev => prev.filter(func => func.id !== id));
  };

  const toggleVisibility = (id: number) => {
    setFunctions(prev => prev.map(func => 
      func.id === id ? { ...func, visible: !func.visible } : func
    ));
  };

  const applyPreset = useCallback((preset: any) => {
    setFunctions([]);
    setIsLoading(true);
    
    // Apply domain and range immediately
    setDomain(preset.domain);
    setRange(preset.range);
    
    // Small delay to ensure state updates
    setTimeout(() => {
      const newFunctions = preset.functions.map((func: string, index: number) => ({
        id: Date.now() + index,
        expression: func,
        color: preset.colors[index] || '#00c2a8',
        visible: true
      }));
      
      setFunctions(newFunctions);
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    drawGrid();
    functions.forEach(func => {
      if (func.visible) {
        plotFunction(func.expression, func.color);
      }
    });
  }, [functions, domain, range, drawGrid, plotFunction]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setLastMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    const deltaX = currentPos.x - lastMousePos.x;
    const deltaY = currentPos.y - lastMousePos.y;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos(currentPos);
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const centerX = (domain.min + domain.max) / 2;
    const centerY = (range.min + range.max) / 2;
    const newWidth = (domain.max - domain.min) * zoomFactor;
    const newHeight = (range.max - range.min) * zoomFactor;
    
    setDomain({
      min: centerX - newWidth / 2,
      max: centerX + newWidth / 2
    });
    
    setRange({
      min: centerY - newHeight / 2,
      max: centerY + newHeight / 2
    });
  }, [domain, range]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
          toast({
            title: "Fullscreen Error",
            description: "Unable to enter fullscreen mode",
            variant: "destructive"
          });
        });
      }
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  return (
    <div className="w-full h-full bg-prism-surface rounded-lg border border-prism-border p-4">
      {/* Header and Controls */}
      <div className="mb-4 flex items-center justify-between">
        <CardTitle className="text-lg font-semibold text-prism-text">
          Advanced Cartesian Graph
        </CardTitle>
        
        {/* Preset Select */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="presets" className="text-sm text-prism-text-muted">
            Presets:
          </Label>
          <select
            id="presets"
            className="bg-prism-bg border border-prism-border rounded-md text-sm text-prism-text px-2 py-1 focus:outline-none"
            onChange={(e) => {
              const selectedPreset = presets.find(p => p.name === e.target.value);
              if (selectedPreset) {
                applyPreset(selectedPreset);
              }
            }}
          >
            <option>Select Preset</option>
            {presets.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-prism-bg/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-prism-primary" />
              <span className="text-prism-text-muted">Loading graph...</span>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-prism-border rounded-lg bg-prism-bg cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-prism-surface/80"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Function List and Controls */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Enter function (e.g., x^2, sin(x))"
            value={newFunction}
            onChange={(e) => setNewFunction(e.target.value)}
            className="bg-prism-bg border border-prism-border text-prism-text"
          />
          <Button onClick={addFunction} className="bg-prism-primary hover:bg-prism-primary-dark text-white">
            Add Function
          </Button>
        </div>
        
        {/* Domain and Range Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="domainMin" className="text-sm text-prism-text-muted">
              Domain Min: {domain.min.toFixed(1)}
            </Label>
            <Slider
              id="domainMin"
              min={-20}
              max={domain.max}
              step={0.1}
              value={[domain.min]}
              onValueChange={(value) => setDomain(prev => ({ ...prev, min: value[0] }))}
            />
          </div>
          <div>
            <Label htmlFor="domainMax" className="text-sm text-prism-text-muted">
              Domain Max: {domain.max.toFixed(1)}
            </Label>
            <Slider
              id="domainMax"
              min={domain.min}
              max={20}
              step={0.1}
              value={[domain.max]}
              onValueChange={(value) => setDomain(prev => ({ ...prev, max: value[0] }))}
            />
          </div>
          <div>
            <Label htmlFor="rangeMin" className="text-sm text-prism-text-muted">
              Range Min: {range.min.toFixed(1)}
            </Label>
            <Slider
              id="rangeMin"
              min={-20}
              max={range.max}
              step={0.1}
              value={[range.min]}
              onValueChange={(value) => setRange(prev => ({ ...prev, min: value[0] }))}
            />
          </div>
          <div>
            <Label htmlFor="rangeMax" className="text-sm text-prism-text-muted">
              Range Max: {range.max.toFixed(1)}
            </Label>
            <Slider
              id="rangeMax"
              min={range.min}
              max={20}
              step={0.1}
              value={[range.max]}
              onValueChange={(value) => setRange(prev => ({ ...prev, max: value[0] }))}
            />
          </div>
        </div>

        {/* Function List */}
        <ul>
          {functions.map(func => (
            <li key={func.id} className="flex items-center justify-between py-2 border-b border-prism-border">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`visible-${func.id}`}
                  className="mr-2"
                  checked={func.visible}
                  onChange={() => toggleVisibility(func.id)}
                />
                <Label htmlFor={`visible-${func.id}`} className="text-prism-text">
                  {func.expression}
                </Label>
                <div
                  className="ml-2 w-4 h-4 rounded-full"
                  style={{ backgroundColor: func.color }}
                ></div>
              </div>
              <Button onClick={() => removeFunction(func.id)} variant="ghost" size="sm">
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdvancedCartesianGraph;
