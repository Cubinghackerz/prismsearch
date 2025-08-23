
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom } from 'lucide-react';

interface PhysicsKeyboardProps {
  onInsert: (symbol: string) => void;
}

const PhysicsKeyboard: React.FC<PhysicsKeyboardProps> = ({ onInsert }) => {
  const basicSymbols = [
    { symbol: '+', label: 'Plus' },
    { symbol: '-', label: 'Minus' },
    { symbol: '×', label: 'Multiply' },
    { symbol: '÷', label: 'Divide' },
    { symbol: '=', label: 'Equals' },
    { symbol: '(', label: 'Left Parenthesis' },
    { symbol: ')', label: 'Right Parenthesis' },
    { symbol: '^', label: 'Power' },
    { symbol: '²', label: 'Squared' },
    { symbol: '³', label: 'Cubed' },
  ];

  const unitsSymbols = [
    { symbol: 'm', label: 'meter' },
    { symbol: 'kg', label: 'kilogram' },
    { symbol: 's', label: 'second' },
    { symbol: 'A', label: 'ampere' },
    { symbol: 'K', label: 'kelvin' },
    { symbol: 'mol', label: 'mole' },
    { symbol: 'cd', label: 'candela' },
    { symbol: 'N', label: 'newton' },
    { symbol: 'J', label: 'joule' },
    { symbol: 'W', label: 'watt' },
    { symbol: 'V', label: 'volt' },
    { symbol: 'Ω', label: 'ohm' },
    { symbol: 'Hz', label: 'hertz' },
    { symbol: 'Pa', label: 'pascal' },
  ];

  const constantsSymbols = [
    { symbol: 'c', label: 'speed of light' },
    { symbol: 'h', label: 'Planck constant' },
    { symbol: 'ℏ', label: 'reduced Planck constant' },
    { symbol: 'G', label: 'gravitational constant' },
    { symbol: 'g', label: 'acceleration due to gravity' },
    { symbol: 'e', label: 'elementary charge' },
    { symbol: 'mₑ', label: 'electron mass' },
    { symbol: 'mₚ', label: 'proton mass' },
    { symbol: 'k_B', label: 'Boltzmann constant' },
    { symbol: 'N_A', label: 'Avogadro number' },
    { symbol: 'R', label: 'gas constant' },
    { symbol: 'ε₀', label: 'permittivity of free space' },
    { symbol: 'μ₀', label: 'permeability of free space' },
    { symbol: 'σ', label: 'Stefan-Boltzmann constant' },
  ];

  const operatorsSymbols = [
    { symbol: '∂', label: 'partial derivative' },
    { symbol: '∇', label: 'nabla/del operator' },
    { symbol: '∫', label: 'integral' },
    { symbol: '∑', label: 'summation' },
    { symbol: '∏', label: 'product' },
    { symbol: '√', label: 'square root' },
    { symbol: '∞', label: 'infinity' },
    { symbol: '≈', label: 'approximately equal' },
    { symbol: '≤', label: 'less than or equal' },
    { symbol: '≥', label: 'greater than or equal' },
    { symbol: '±', label: 'plus or minus' },
    { symbol: '∓', label: 'minus or plus' },
    { symbol: '→', label: 'approaches/yields' },
    { symbol: '∝', label: 'proportional to' },
  ];

  const greekSymbols = [
    { symbol: 'α', label: 'alpha' },
    { symbol: 'β', label: 'beta' },
    { symbol: 'γ', label: 'gamma' },
    { symbol: 'δ', label: 'delta' },
    { symbol: 'ε', label: 'epsilon' },
    { symbol: 'θ', label: 'theta' },
    { symbol: 'λ', label: 'lambda' },
    { symbol: 'μ', label: 'mu' },
    { symbol: 'π', label: 'pi' },
    { symbol: 'ρ', label: 'rho' },
    { symbol: 'σ', label: 'sigma' },
    { symbol: 'τ', label: 'tau' },
    { symbol: 'φ', label: 'phi' },
    { symbol: 'ω', label: 'omega' },
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
          <Atom className="h-5 w-5" />
          <span>Physics Symbols & Constants</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-prism-surface/30">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="constants">Constants</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="greek">Greek</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <SymbolGrid symbols={basicSymbols} />
          </TabsContent>
          
          <TabsContent value="units" className="mt-4">
            <SymbolGrid symbols={unitsSymbols} />
          </TabsContent>
          
          <TabsContent value="constants" className="mt-4">
            <SymbolGrid symbols={constantsSymbols} />
          </TabsContent>
          
          <TabsContent value="operators" className="mt-4">
            <SymbolGrid symbols={operatorsSymbols} />
          </TabsContent>
          
          <TabsContent value="greek" className="mt-4">
            <SymbolGrid symbols={greekSymbols} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PhysicsKeyboard;
