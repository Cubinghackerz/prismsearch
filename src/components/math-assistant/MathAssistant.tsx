
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Sigma, PieChart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

const MathAssistant = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Array<{input: string, result: string}>>([]);
  const [activeTab, setActiveTab] = useState('calculator');

  const examples = {
    calculator: [
      "# Basic calculations\n2 + 2",
      "# Solve equations\nfrom sympy import *\nx = symbols('x')\nsolve(x**2 - 4, x)",
      "# Calculus\nfrom sympy import *\nx = symbols('x')\ndiff(x**3 + 2*x**2 + x, x)"
    ],
    algebra: [
      "# Expand expressions\nfrom sympy import *\nx = symbols('x')\nexpand((x + 1)**3)",
      "# Factor expressions\nfrom sympy import *\nx = symbols('x')\nfactor(x**2 - 4)",
      "# Simplify expressions\nfrom sympy import *\nsimplify((x**2 - 1)/(x - 1))"
    ],
    calculus: [
      "# Derivatives\nfrom sympy import *\nx = symbols('x')\ndiff(sin(x)*cos(x), x)",
      "# Integrals\nfrom sympy import *\nx = symbols('x')\nintegrate(x**2, x)",
      "# Limits\nfrom sympy import *\nx = symbols('x')\nlimit(sin(x)/x, x, 0)"
    ]
  };

  useEffect(() => {
    const loadPyodideEnvironment = async () => {
      try {
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
          const pyodideInstance = await window.loadPyodide();
          await pyodideInstance.loadPackage(['sympy', 'numpy', 'matplotlib']);
          setPyodide(pyodideInstance);
          setLoading(false);
          toast.success('Math Assistant ready!');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        toast.error('Failed to load math environment');
        setLoading(false);
      }
    };

    loadPyodideEnvironment();
  }, []);

  const executeCode = async () => {
    if (!pyodide || !input.trim()) return;

    try {
      setLoading(true);
      // Capture both stdout and the result
      pyodide.runPython(`
import sys
from io import StringIO
import contextlib

@contextlib.contextmanager
def capture_output():
    old_stdout = sys.stdout
    sys.stdout = mystdout = StringIO()
    try:
        yield mystdout
    finally:
        sys.stdout = old_stdout

output_buffer = StringIO()
result_value = None
`);

      const code = `
with capture_output() as output:
    try:
        result_value = ${input}
        if result_value is not None:
            print(result_value)
    except Exception as e:
        print(f"Error: {e}")

captured_output = output.getvalue()
`;

      pyodide.runPython(code);
      const output = pyodide.globals.get('captured_output');
      
      setResult(output || 'Executed successfully (no output)');
      setHistory(prev => [...prev, { input, result: output || 'No output' }]);
      toast.success('Calculation completed');
    } catch (error) {
      const errorMessage = `Error: ${error}`;
      setResult(errorMessage);
      setHistory(prev => [...prev, { input, result: errorMessage }]);
      toast.error('Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const insertExample = (example: string) => {
    setInput(example);
  };

  const clearHistory = () => {
    setHistory([]);
    setResult('');
    toast.success('History cleared');
  };

  if (loading && !pyodide) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calculator className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p className="text-lg">Loading Math Assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Math Assistant
        </h1>
        <p className="text-xl text-muted-foreground">
          Powered by SymPy - Solve equations, calculate derivatives, and more
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="algebra" className="flex items-center gap-2">
            <Sigma className="h-4 w-4" />
            Algebra
          </TabsTrigger>
          <TabsTrigger value="calculus" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Calculus
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
                <CardDescription>Click an example to try it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {examples[activeTab as keyof typeof examples].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 whitespace-pre-wrap font-mono text-sm"
                    onClick={() => insertExample(example)}
                  >
                    {example}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Enter Python/SymPy code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your mathematical expression or SymPy code..."
                  className="min-h-32 font-mono"
                />
                <div className="flex gap-2">
                  <Button onClick={executeCode} disabled={loading || !input.trim()}>
                    {loading ? 'Calculating...' : 'Calculate'}
                  </Button>
                  <Button variant="outline" onClick={() => setInput('')}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Result
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    Clear History
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result && (
                <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-4">
                  {result}
                </div>
              )}
              
              {history.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">History</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {history.slice(-5).reverse().map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground mb-1">Input:</div>
                        <div className="font-mono text-sm mb-2 whitespace-pre-wrap">{item.input}</div>
                        <div className="text-sm text-muted-foreground mb-1">Output:</div>
                        <div className="font-mono text-sm bg-muted p-2 rounded whitespace-pre-wrap">{item.result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MathAssistant;
