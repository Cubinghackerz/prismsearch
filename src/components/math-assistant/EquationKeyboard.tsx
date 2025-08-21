
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Keyboard } from 'lucide-react';

interface EquationKeyboardProps {
  onInsert: (symbol: string) => void;
}

const EquationKeyboard: React.FC<EquationKeyboardProps> = ({ onInsert }) => {
  const basicSymbols = [
    { symbol: '+', label: 'Plus' },
    { symbol: '-', label: 'Minus' },
    { symbol: '*', label: 'Multiply' },
    { symbol: '/', label: 'Divide' },
    { symbol: '=', label: 'Equals' },
    { symbol: '(', label: 'Left Parenthesis' },
    { symbol: ')', label: 'Right Parenthesis' },
    { symbol: '^', label: 'Power' },
    { symbol: 'π', label: 'Pi' },
    { symbol: 'e', label: 'Euler\'s number' },
  ];

  const algebraSymbols = [
    { symbol: '√', label: 'Square Root' },
    { symbol: '∛', label: 'Cube Root' },
    { symbol: '∜', label: 'Fourth Root' },
    { symbol: 'x²', label: 'x squared' },
    { symbol: 'x³', label: 'x cubed' },
    { symbol: '±', label: 'Plus/Minus' },
    { symbol: '∞', label: 'Infinity' },
    { symbol: '≠', label: 'Not Equal' },
    { symbol: '≤', label: 'Less than or Equal' },
    { symbol: '≥', label: 'Greater than or Equal' },
  ];

  const calculusSymbols = [
    { symbol: '∫', label: 'Integral' },
    { symbol: '∬', label: 'Double Integral' },
    { symbol: '∭', label: 'Triple Integral' },
    { symbol: 'd/dx', label: 'Derivative' },
    { symbol: '∂/∂x', label: 'Partial Derivative' },
    { symbol: 'lim', label: 'Limit' },
    { symbol: '∑', label: 'Sum' },
    { symbol: '∏', label: 'Product' },
    { symbol: '→', label: 'Approaches' },
    { symbol: '∆', label: 'Delta' },
  ];

  const trigSymbols = [
    { symbol: 'sin', label: 'Sine' },
    { symbol: 'cos', label: 'Cosine' },
    { symbol: 'tan', label: 'Tangent' },
    { symbol: 'csc', label: 'Cosecant' },
    { symbol: 'sec', label: 'Secant' },
    { symbol: 'cot', label: 'Cotangent' },
    { symbol: 'arcsin', label: 'Arcsine' },
    { symbol: 'arccos', label: 'Arccosine' },
    { symbol: 'arctan', label: 'Arctangent' },
    { symbol: 'sinh', label: 'Hyperbolic Sine' },
  ];

  const greekSymbols = [
    { symbol: 'α', label: 'Alpha' },
    { symbol: 'β', label: 'Beta' },
    { symbol: 'γ', label: 'Gamma' },
    { symbol: 'δ', label: 'Delta' },
    { symbol: 'ε', label: 'Epsilon' },
    { symbol: 'ζ', label: 'Zeta' },
    { symbol: 'η', label: 'Eta' },
    { symbol: 'θ', label: 'Theta' },
    { symbol: 'λ', label: 'Lambda' },
    { symbol: 'μ', label: 'Mu' },
    { symbol: 'σ', label: 'Sigma' },
    { symbol: 'φ', label: 'Phi' },
    { symbol: 'ψ', label: 'Psi' },
    { symbol: 'ω', label: 'Omega' },
  ];

  const SymbolGrid: React.FC<{ symbols: { symbol: string; label: string }[] }> = ({ symbols }) => (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {symbols.map((item) => (
        <Button
          key={item.symbol}
          variant="outline"
          size="sm"
          onClick={() => onInsert(item.symbol)}
          className="h-10 text-sm font-mono hover:bg-prism-primary/20 hover:border-prism-primary"
          title={item.label}
        >
          {item.symbol}
        </Button>
      ))}
    </div>
  );

  return (
    <Card className="bg-prism-surface/50 border-prism-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Keyboard className="h-5 w-5" />
          <span>Mathematical Symbols & Functions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-prism-surface/30">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="algebra">Algebra</TabsTrigger>
            <TabsTrigger value="calculus">Calculus</TabsTrigger>
            <TabsTrigger value="trig">Trig</TabsTrigger>
            <TabsTrigger value="greek">Greek</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <SymbolGrid symbols={basicSymbols} />
          </TabsContent>
          
          <TabsContent value="algebra" className="mt-4">
            <SymbolGrid symbols={algebraSymbols} />
          </TabsContent>
          
          <TabsContent value="calculus" className="mt-4">
            <SymbolGrid symbols={calculusSymbols} />
          </TabsContent>
          
          <TabsContent value="trig" className="mt-4">
            <SymbolGrid symbols={trigSymbols} />
          </TabsContent>
          
          <TabsContent value="greek" className="mt-4">
            <SymbolGrid symbols={greekSymbols} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EquationKeyboard;
