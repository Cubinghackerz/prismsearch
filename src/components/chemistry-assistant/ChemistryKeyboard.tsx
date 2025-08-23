
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical } from 'lucide-react';

interface ChemistryKeyboardProps {
  onInsert: (symbol: string) => void;
}

const ChemistryKeyboard: React.FC<ChemistryKeyboardProps> = ({ onInsert }) => {
  const basicSymbols = [
    { symbol: '+', label: 'Plus' },
    { symbol: '-', label: 'Minus' },
    { symbol: '=', label: 'Equals' },
    { symbol: '→', label: 'Yields' },
    { symbol: '⇌', label: 'Equilibrium' },
    { symbol: '(', label: 'Left Parenthesis' },
    { symbol: ')', label: 'Right Parenthesis' },
    { symbol: '[', label: 'Left Bracket' },
    { symbol: ']', label: 'Right Bracket' },
    { symbol: '·', label: 'Dot (hydrate)' },
  ];

  const elementsSymbols = [
    { symbol: 'H', label: 'Hydrogen' },
    { symbol: 'He', label: 'Helium' },
    { symbol: 'Li', label: 'Lithium' },
    { symbol: 'Be', label: 'Beryllium' },
    { symbol: 'B', label: 'Boron' },
    { symbol: 'C', label: 'Carbon' },
    { symbol: 'N', label: 'Nitrogen' },
    { symbol: 'O', label: 'Oxygen' },
    { symbol: 'F', label: 'Fluorine' },
    { symbol: 'Ne', label: 'Neon' },
    { symbol: 'Na', label: 'Sodium' },
    { symbol: 'Mg', label: 'Magnesium' },
    { symbol: 'Al', label: 'Aluminum' },
    { symbol: 'Si', label: 'Silicon' },
    { symbol: 'P', label: 'Phosphorus' },
    { symbol: 'S', label: 'Sulfur' },
    { symbol: 'Cl', label: 'Chlorine' },
    { symbol: 'Ar', label: 'Argon' },
    { symbol: 'K', label: 'Potassium' },
    { symbol: 'Ca', label: 'Calcium' },
  ];

  const subscriptsSymbols = [
    { symbol: '₀', label: 'subscript 0' },
    { symbol: '₁', label: 'subscript 1' },
    { symbol: '₂', label: 'subscript 2' },
    { symbol: '₃', label: 'subscript 3' },
    { symbol: '₄', label: 'subscript 4' },
    { symbol: '₅', label: 'subscript 5' },
    { symbol: '₆', label: 'subscript 6' },
    { symbol: '₇', label: 'subscript 7' },
    { symbol: '₈', label: 'subscript 8' },
    { symbol: '₉', label: 'subscript 9' },
  ];

  const superscriptsSymbols = [
    { symbol: '⁰', label: 'superscript 0' },
    { symbol: '¹', label: 'superscript 1' },
    { symbol: '²', label: 'superscript 2' },
    { symbol: '³', label: 'superscript 3' },
    { symbol: '⁴', label: 'superscript 4' },
    { symbol: '⁵', label: 'superscript 5' },
    { symbol: '⁶', label: 'superscript 6' },
    { symbol: '⁷', label: 'superscript 7' },
    { symbol: '⁸', label: 'superscript 8' },
    { symbol: '⁹', label: 'superscript 9' },
    { symbol: '⁺', label: 'superscript plus' },
    { symbol: '⁻', label: 'superscript minus' },
  ];

  const specialSymbols = [
    { symbol: 'Δ', label: 'delta (change)' },
    { symbol: '∆H', label: 'enthalpy change' },
    { symbol: '∆G', label: 'Gibbs energy change' },
    { symbol: '∆S', label: 'entropy change' },
    { symbol: 'ΔT', label: 'temperature change' },
    { symbol: 'pH', label: 'pH' },
    { symbol: 'pOH', label: 'pOH' },
    { symbol: 'Kₐ', label: 'acid dissociation constant' },
    { symbol: 'Kᵦ', label: 'base dissociation constant' },
    { symbol: 'Kw', label: 'water dissociation constant' },
    { symbol: '°C', label: 'degrees Celsius' },
    { symbol: 'K', label: 'Kelvin' },
    { symbol: 'atm', label: 'atmosphere' },
    { symbol: 'mol', label: 'mole' },
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
          <FlaskConical className="h-5 w-5" />
          <span>Chemistry Symbols & Elements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-prism-surface/30">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="subscripts">Subscripts</TabsTrigger>
            <TabsTrigger value="superscripts">Superscripts</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <SymbolGrid symbols={basicSymbols} />
          </TabsContent>
          
          <TabsContent value="elements" className="mt-4">
            <SymbolGrid symbols={elementsSymbols} />
          </TabsContent>
          
          <TabsContent value="subscripts" className="mt-4">
            <SymbolGrid symbols={subscriptsSymbols} />
          </TabsContent>
          
          <TabsContent value="superscripts" className="mt-4">
            <SymbolGrid symbols={superscriptsSymbols} />
          </TabsContent>
          
          <TabsContent value="special" className="mt-4">
            <SymbolGrid symbols={specialSymbols} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChemistryKeyboard;
