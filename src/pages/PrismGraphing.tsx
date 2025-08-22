
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, Zap, Download, RotateCcw, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

const PrismGraphing = () => {
  const [equation, setEquation] = useState('x^2');
  const [equationType, setEquationType] = useState('polynomial');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [graphData, setGraphData] = useState<{x: number, y: number}[]>([]);
  const [equations, setEquations] = useState<{id: string, equation: string, color: string, visible: boolean}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

  const presetEquations = {
    polynomial: [
      { name: 'Quadratic', equation: 'x^2', description: 'Simple parabola' },
      { name: 'Cubic', equation: 'x^3', description: 'Cubic function' },
      { name: 'Quartic', equation: 'x^4', description: 'Fourth degree polynomial' }
    ],
    trigonometric: [
      { name: 'Sine', equation: 'sin(x)', description: 'Sine wave' },
      { name: 'Cosine', equation: 'cos(x)', description: 'Cosine wave' },
      { name: 'Tangent', equation: 'tan(x)', description: 'Tangent function' }
    ],
    exponential: [
      { name: 'Exponential', equation: 'e^x', description: 'Natural exponential' },
      { name: 'Power of 2', equation: '2^x', description: 'Base 2 exponential' },
      { name: 'Logarithm', equation: 'ln(x)', description: 'Natural logarithm' }
    ],
    complex: [
      { name: 'Absolute Value', equation: 'abs(x)', description: 'Absolute value function' },
      { name: 'Square Root', equation: 'sqrt(x)', description: 'Square root function' },
      { name: 'Reciprocal', equation: '1/x', description: 'Hyperbola' }
    ]
  };

  const evaluateEquation = (expr: string, x: number): number => {
    try {
      // Replace mathematical functions and constants
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
        .replace(/e/g, 'Math.E')
        .replace(/pi/g, 'Math.PI')
        .replace(/x/g, x.toString());

      // Handle implicit multiplication (e.g., 2x becomes 2*x)
      processedExpr = processedExpr.replace(/(\d)([a-zA-Z])/g, '$1*$2');
      processedExpr = processedExpr.replace(/([a-zA-Z])(\d)/g, '$1*$2');

      const result = Function('"use strict"; return (' + processedExpr + ')')();
      return isNaN(result) || !isFinite(result) ? null : result;
    } catch (error) {
      return null;
    }
  };

  const generateGraphData = (eq: string) => {
    const data = [];
    const step = (xMax - xMin) / 1000;
    
    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateEquation(eq, x);
      if (y !== null && y >= yMin && y <= yMax) {
        data.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
      }
    }
    return data;
  };

  const plotEquation = () => {
    try {
      const data = generateGraphData(equation);
      if (data.length === 0) {
        toast.error('Invalid equation or no valid points in range');
        return;
      }
      setGraphData(data);
      toast.success('Equation plotted successfully!');
    } catch (error) {
      toast.error('Error plotting equation');
    }
  };

  const addEquation = () => {
    if (!equation.trim()) {
      toast.error('Please enter an equation');
      return;
    }

    const newEquation = {
      id: Date.now().toString(),
      equation: equation.trim(),
      color: colors[equations.length % colors.length],
      visible: true
    };

    setEquations([...equations, newEquation]);
    toast.success('Equation added to graph');
  };

  const removeEquation = (id: string) => {
    setEquations(equations.filter(eq => eq.id !== id));
    toast.success('Equation removed');
  };

  const toggleEquationVisibility = (id: string) => {
    setEquations(equations.map(eq => 
      eq.id === id ? { ...eq, visible: !eq.visible } : eq
    ));
  };

  const resetGraph = () => {
    setGraphData([]);
    setEquations([]);
    setEquation('x^2');
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
    toast.success('Graph reset');
  };

  const downloadGraph = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'graph.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Graph downloaded');
    }
  };

  useEffect(() => {
    if (equation) {
      plotEquation();
    }
  }, [xMin, xMax, yMin, yMax]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Calculator className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold font-fira-code">Prism Graphing Tool</h1>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              New
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Plot mathematical equations, analyze functions, and visualize complex mathematical relationships with our advanced graphing calculator.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Equation Input</span>
                </CardTitle>
                <CardDescription>
                  Enter mathematical equations to plot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="equation">Equation (use x as variable)</Label>
                  <Input
                    id="equation"
                    value={equation}
                    onChange={(e) => setEquation(e.target.value)}
                    placeholder="e.g., x^2, sin(x), 2*x + 1"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Equation Type</Label>
                  <Select value={equationType} onValueChange={setEquationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polynomial">Polynomial</SelectItem>
                      <SelectItem value="trigonometric">Trigonometric</SelectItem>
                      <SelectItem value="exponential">Exponential/Log</SelectItem>
                      <SelectItem value="complex">Complex Functions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={plotEquation} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Plot
                  </Button>
                  <Button onClick={addEquation} variant="outline" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Graph Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="xmin">X Min</Label>
                    <Input
                      id="xmin"
                      type="number"
                      value={xMin}
                      onChange={(e) => setXMin(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="xmax">X Max</Label>
                    <Input
                      id="xmax"
                      type="number"
                      value={xMax}
                      onChange={(e) => setXMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="ymin">Y Min</Label>
                    <Input
                      id="ymin"
                      type="number"
                      value={yMin}
                      onChange={(e) => setYMin(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ymax">Y Max</Label>
                    <Input
                      id="ymax"
                      type="number"
                      value={yMax}
                      onChange={(e) => setYMax(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {equations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Equations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {equations.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: eq.color }}
                        />
                        <span className="font-mono text-sm">{eq.equation}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleEquationVisibility(eq.id)}
                        >
                          {eq.visible ? '👁️' : '👁️‍🗨️'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeEquation(eq.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-2">
              <Button onClick={resetGraph} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={downloadGraph} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Graph Display */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="h-96">
              <CardHeader>
                <CardTitle>Graph Visualization</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      type="number" 
                      scale="linear"
                      domain={[xMin, xMax]}
                    />
                    <YAxis 
                      type="number" 
                      scale="linear"
                      domain={[yMin, yMax]}
                    />
                    <Tooltip 
                      formatter={(value, name) => [Number(value).toFixed(3), 'f(x)']}
                      labelFormatter={(value) => `x = ${Number(value).toFixed(3)}`}
                    />
                    <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                    <Line 
                      type="monotone" 
                      dataKey="y" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                    {equations.filter(eq => eq.visible).map((eq) => {
                      const data = generateGraphData(eq.equation);
                      return (
                        <Line
                          key={eq.id}
                          data={data}
                          type="monotone"
                          dataKey="y"
                          stroke={eq.color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </CardContent>
            </Card>

            {/* Preset Equations */}
            <Card>
              <CardHeader>
                <CardTitle>Preset Equations</CardTitle>
                <CardDescription>
                  Click on any preset to quickly plot common mathematical functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={equationType} onValueChange={setEquationType}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
                    <TabsTrigger value="trigonometric">Trig</TabsTrigger>
                    <TabsTrigger value="exponential">Exp/Log</TabsTrigger>
                    <TabsTrigger value="complex">Complex</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(presetEquations).map(([type, equations]) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {equations.map((preset) => (
                          <Card 
                            key={preset.name}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => setEquation(preset.equation)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold">{preset.name}</h4>
                              <p className="text-sm text-muted-foreground font-mono">
                                {preset.equation}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {preset.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrismGraphing;
