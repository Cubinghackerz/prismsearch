
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChemistryKeyboardProps {
  onInsert: (text: string) => void;
}

const ChemistryKeyboard: React.FC<ChemistryKeyboardProps> = ({ onInsert }) => {
  const elements = [
    { label: 'H', value: 'H' },
    { label: 'He', value: 'He' },
    { label: 'Li', value: 'Li' },
    { label: 'Be', value: 'Be' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'N', value: 'N' },
    { label: 'O', value: 'O' },
    { label: 'F', value: 'F' },
    { label: 'Ne', value: 'Ne' },
    { label: 'Na', value: 'Na' },
    { label: 'Mg', value: 'Mg' },
    { label: 'Al', value: 'Al' },
    { label: 'Si', value: 'Si' },
    { label: 'P', value: 'P' },
    { label: 'S', value: 'S' },
    { label: 'Cl', value: 'Cl' },
    { label: 'Ar', value: 'Ar' },
    { label: 'K', value: 'K' },
    { label: 'Ca', value: 'Ca' },
    { label: 'Fe', value: 'Fe' },
    { label: 'Cu', value: 'Cu' },
    { label: 'Zn', value: 'Zn' },
    { label: 'Ag', value: 'Ag' },
  ];

  const subscripts = [
    { label: '₀', value: '₀' },
    { label: '₁', value: '₁' },
    { label: '₂', value: '₂' },
    { label: '₃', value: '₃' },
    { label: '₄', value: '₄' },
    { label: '₅', value: '₅' },
    { label: '₆', value: '₆' },
    { label: '₇', value: '₇' },
    { label: '₈', value: '₈' },
    { label: '₉', value: '₉' },
  ];

  const superscripts = [
    { label: '⁰', value: '⁰' },
    { label: '¹', value: '¹' },
    { label: '²', value: '²' },
    { label: '³', value: '³' },
    { label: '⁴', value: '⁴' },
    { label: '⁵', value: '⁵' },
    { label: '⁶', value: '⁶' },
    { label: '⁷', value: '⁷' },
    { label: '⁸', value: '⁸' },
    { label: '⁹', value: '⁹' },
    { label: '⁺', value: '⁺' },
    { label: '⁻', value: '⁻' },
  ];

  const symbols = [
    { label: '→', value: '→', display: '→ (yields)' },
    { label: '⇌', value: '⇌', display: '⇌ (equilibrium)' },
    { label: '↑', value: '↑', display: '↑ (gas)' },
    { label: '↓', value: '↓', display: '↓ (precipitate)' },
    { label: 'Δ', value: 'Δ', display: 'Δ (heat)' },
    { label: '°C', value: '°C', display: '°C (celsius)' },
    { label: 'K', value: 'K', display: 'K (kelvin)' },
    { label: 'atm', value: 'atm', display: 'atm (atmosphere)' },
    { label: 'mol', value: 'mol', display: 'mol (mole)' },
    { label: 'L', value: 'L', display: 'L (liter)' },
    { label: 'g', value: 'g', display: 'g (gram)' },
    { label: 'M', value: 'M', display: 'M (molarity)' },
  ];

  return (
    <Card className="bg-prism-surface/30 border-prism-border">
      <CardHeader>
        <CardTitle className="text-lg">Chemistry Keyboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="subscripts">Subscripts</TabsTrigger>
            <TabsTrigger value="superscripts">Superscripts</TabsTrigger>
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
          </TabsList>
          
          <TabsContent value="elements" className="space-y-2">
            <div className="grid grid-cols-8 gap-2">
              {elements.map((element) => (
                <Button
                  key={element.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(element.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {element.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="subscripts" className="space-y-2">
            <div className="grid grid-cols-10 gap-2">
              {subscripts.map((sub) => (
                <Button
                  key={sub.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(sub.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {sub.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="superscripts" className="space-y-2">
            <div className="grid grid-cols-8 gap-2">
              {superscripts.map((sup) => (
                <Button
                  key={sup.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(sup.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {sup.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="symbols" className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {symbols.map((symbol) => (
                <Button
                  key={symbol.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(symbol.value)}
                  className="h-12 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border text-xs"
                >
                  {symbol.display}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChemistryKeyboard;
