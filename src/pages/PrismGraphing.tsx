import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calculator, Zap, Download, RotateCcw, Plus, Minus, Eye, EyeOff, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import AdvancedCartesianGraph from '@/components/graphing/AdvancedCartesianGraph';

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

const PrismGraphing = () => {
  const [equation, setEquation] = useState('x^2');
  const [equationType, setEquationType] = useState<EquationData['type']>('explicit');
  const [equationStyle, setEquationStyle] = useState<EquationData['style']>('solid');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [equations, setEquations] = useState<EquationData[]>([]);
  const [showParameters, setShowParameters] = useState(false);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

  const presetEquations = {
    linear: [
      { name: 'y = mx + b', equation: 'a*x + b', description: 'Slope-intercept form', params: [
        { name: 'a', value: 1, min: -5, max: 5, step: 0.1 },
        { name: 'b', value: 0, min: -10, max: 10, step: 0.5 }
      ]},
      { name: 'Vertical Line', equation: 'x = 2', description: 'x = constant', type: 'implicit' as const },
      { name: 'Horizontal Line', equation: 'y = 1', description: 'y = constant', type: 'explicit' as const }
    ],
    polynomial: [
      { name: 'Quadratic', equation: 'a*x^2 + b*x + c', description: 'Parabola', params: [
        { name: 'a', value: 1, min: -3, max: 3, step: 0.1 },
        { name: 'b', value: 0, min: -5, max: 5, step: 0.5 },
        { name: 'c', value: 0, min: -10, max: 10, step: 0.5 }
      ]},
      { name: 'Cubic', equation: 'a*x^3 + b*x^2 + c*x + d', description: 'Cubic function', params: [
        { name: 'a', value: 1, min: -2, max: 2, step: 0.1 },
        { name: 'b', value: 0, min: -3, max: 3, step: 0.1 },
        { name: 'c', value: 0, min: -5, max: 5, step: 0.5 },
        { name: 'd', value: 0, min: -10, max: 10, step: 0.5 }
      ]},
      { name: 'Quartic', equation: 'x^4', description: 'Fourth degree polynomial' }
    ],
    trigonometric: [
      { name: 'Sine Wave', equation: 'a*sin(b*x + c) + d', description: 'Sine function', params: [
        { name: 'a', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'b', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'c', value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
        { name: 'd', value: 0, min: -5, max: 5, step: 0.5 }
      ]},
      { name: 'Cosine Wave', equation: 'a*cos(b*x + c) + d', description: 'Cosine function', params: [
        { name: 'a', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'b', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'c', value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
        { name: 'd', value: 0, min: -5, max: 5, step: 0.5 }
      ]},
      { name: 'Tangent', equation: 'tan(x)', description: 'Tangent function' }
    ],
    exponential: [
      { name: 'Exponential', equation: 'a*Math.E^(b*x) + c', description: 'Exponential growth/decay', params: [
        { name: 'a', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'b', value: 1, min: -2, max: 2, step: 0.1 },
        { name: 'c', value: 0, min: -5, max: 5, step: 0.5 }
      ]},
      { name: 'Logarithm', equation: 'a*ln(b*x + c) + d', description: 'Natural logarithm', params: [
        { name: 'a', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'b', value: 1, min: 0.1, max: 3, step: 0.1 },
        { name: 'c', value: 1, min: 0.1, max: 5, step: 0.1 },
        { name: 'd', value: 0, min: -5, max: 5, step: 0.5 }
      ]}
    ],
    advanced: [
      { name: 'Circle', equation: 'x^2 + y^2 = 25', description: 'Circle equation', type: 'implicit' as const },
      { name: 'Ellipse', equation: 'x^2/9 + y^2/4 = 1', description: 'Ellipse equation', type: 'implicit' as const },
      { name: 'Hyperbola', equation: 'x^2/4 - y^2/9 = 1', description: 'Hyperbola equation', type: 'implicit' as const },
      { name: 'Inequality', equation: 'y > x^2', description: 'Quadratic inequality', type: 'inequality' as const }
    ]
  };

  const addEquation = () => {
    if (!equation.trim()) {
      toast.error('Please enter an equation');
      return;
    }

    const newEquation: EquationData = {
      id: Date.now().toString(),
      equation: equation.trim(),
      color: colors[equations.length % colors.length],
      visible: true,
      type: equationType,
      style: equationStyle,
      parameters: showParameters ? [
        { name: 'a', value: 1, min: -5, max: 5, step: 0.1 },
        { name: 'b', value: 0, min: -10, max: 10, step: 0.5 }
      ] : undefined
    };

    setEquations([...equations, newEquation]);
    toast.success('Equation added to graph');
  };

  const removeEquation = (id: string) => {
    setEquations(equations.filter(eq => eq.id !== id));
    toast.success('Equation removed');
  };

  const updateEquation = (id: string, updates: Partial<EquationData>) => {
    setEquations(equations.map(eq => 
      eq.id === id ? { ...eq, ...updates } : eq
    ));
  };

  const toggleEquationVisibility = (id: string) => {
    updateEquation(id, { visible: !equations.find(eq => eq.id === id)?.visible });
  };

  const resetGraph = () => {
    setEquations([]);
    setEquation('x^2');
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
    toast.success('Graph reset');
  };

  const loadPreset = (preset: any) => {
    console.log('Loading preset:', preset);
    
    const newEquation: EquationData = {
      id: Date.now().toString(),
      equation: preset.equation,
      color: colors[equations.length % colors.length],
      visible: true,
      type: preset.type || 'explicit',
      style: 'solid',
      parameters: preset.params
    };
    
    console.log('Created equation:', newEquation);
    setEquations([...equations, newEquation]);
    toast.success(`Added ${preset.name} to graph`);
  };

  const exportGraph = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'prism-graph.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Graph exported successfully!');
    } else {
      toast.error('No graph to export');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-32">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Calculator className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold font-fira-code">Advanced Graphing Tool</h1>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Beta
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Plot mathematical equations with advanced features including linear analysis, interactive parameters, 
            intersection detection, and real-time coordinate tracking.
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
                  Create mathematical equations to visualize
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={equationType} onValueChange={(value) => setEquationType(value as EquationData['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="explicit">Explicit (y=f(x))</SelectItem>
                        <SelectItem value="implicit">Implicit</SelectItem>
                        <SelectItem value="parametric">Parametric</SelectItem>
                        <SelectItem value="inequality">Inequality</SelectItem>
                        <SelectItem value="polar">Polar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Select value={equationStyle} onValueChange={(value) => setEquationStyle(value as EquationData['style'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="parameters"
                    checked={showParameters}
                    onCheckedChange={setShowParameters}
                  />
                  <Label htmlFor="parameters" className="flex items-center space-x-1">
                    <Sliders className="h-4 w-4" />
                    <span>Interactive Parameters</span>
                  </Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={addEquation} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equation
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
                        <Badge variant="outline" className="text-xs">
                          {eq.type}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleEquationVisibility(eq.id)}
                        >
                          {eq.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
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
              <Button onClick={exportGraph} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Graph Display */}
          <div className="lg:col-span-2 space-y-6">
            <AdvancedCartesianGraph
              equations={equations}
              xMin={xMin}
              xMax={xMax}
              yMin={yMin}
              yMax={yMax}
              width={800}
              height={600}
              onEquationUpdate={updateEquation}
            />

            {/* Preset Equations */}
            <Card>
              <CardHeader>
                <CardTitle>Preset Equations</CardTitle>
                <CardDescription>
                  Click on any preset to quickly add common mathematical functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="linear" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="linear">Linear</TabsTrigger>
                    <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
                    <TabsTrigger value="trigonometric">Trig</TabsTrigger>
                    <TabsTrigger value="exponential">Exp/Log</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(presetEquations).map(([type, presets]) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {presets.map((preset, index) => (
                          <Card 
                            key={index}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => loadPreset(preset)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{preset.name}</h4>
                                {preset.params && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sliders className="h-3 w-3 mr-1" />
                                    Interactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground font-mono mb-2">
                                {preset.equation}
                              </p>
                              <p className="text-xs text-muted-foreground">
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
