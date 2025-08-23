
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PhysicsKeyboardProps {
  onInsert: (text: string) => void;
}

const PhysicsKeyboard: React.FC<PhysicsKeyboardProps> = ({ onInsert }) => {
  const symbols = [
    { label: 'π', value: 'π' },
    { label: 'θ', value: 'θ' },
    { label: 'φ', value: 'φ' },
    { label: 'ω', value: 'ω' },
    { label: 'λ', value: 'λ' },
    { label: 'μ', value: 'μ' },
    { label: 'ν', value: 'ν' },
    { label: 'ρ', value: 'ρ' },
    { label: 'σ', value: 'σ' },
    { label: 'τ', value: 'τ' },
    { label: 'Δ', value: 'Δ' },
    { label: 'Σ', value: 'Σ' },
    { label: '∞', value: '∞' },
    { label: '±', value: '±' },
    { label: '≈', value: '≈' },
    { label: '∝', value: '∝' },
  ];

  const units = [
    { label: 'm', value: 'm' },
    { label: 'kg', value: 'kg' },
    { label: 's', value: 's' },
    { label: 'A', value: 'A' },
    { label: 'K', value: 'K' },
    { label: 'mol', value: 'mol' },
    { label: 'cd', value: 'cd' },
    { label: 'N', value: 'N' },
    { label: 'J', value: 'J' },
    { label: 'W', value: 'W' },
    { label: 'Pa', value: 'Pa' },
    { label: 'Hz', value: 'Hz' },
    { label: 'C', value: 'C' },
    { label: 'V', value: 'V' },
    { label: 'Ω', value: 'Ω' },
    { label: 'T', value: 'T' },
  ];

  const constants = [
    { label: 'c', value: '3×10⁸ m/s', display: 'c (speed of light)' },
    { label: 'g', value: '9.81 m/s²', display: 'g (gravity)' },
    { label: 'h', value: '6.626×10⁻³⁴ J⋅s', display: 'h (Planck)' },
    { label: 'ℏ', value: '1.055×10⁻³⁴ J⋅s', display: 'ℏ (reduced Planck)' },
    { label: 'k', value: '1.381×10⁻²³ J/K', display: 'k (Boltzmann)' },
    { label: 'e', value: '1.602×10⁻¹⁹ C', display: 'e (elementary charge)' },
    { label: 'mₑ', value: '9.109×10⁻³¹ kg', display: 'mₑ (electron mass)' },
    { label: 'mₚ', value: '1.673×10⁻²⁷ kg', display: 'mₚ (proton mass)' },
  ];

  const operators = [
    { label: '²', value: '²' },
    { label: '³', value: '³' },
    { label: '⁴', value: '⁴' },
    { label: '⁻¹', value: '⁻¹' },
    { label: '⁻²', value: '⁻²' },
    { label: '√', value: '√' },
    { label: '∫', value: '∫' },
    { label: '∂', value: '∂' },
    { label: '∇', value: '∇' },
    { label: '×', value: '×' },
    { label: '÷', value: '÷' },
    { label: '·', value: '·' },
  ];

  return (
    <Card className="bg-prism-surface/30 border-prism-border">
      <CardHeader>
        <CardTitle className="text-lg">Physics Keyboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="symbols" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="constants">Constants</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
          </TabsList>
          
          <TabsContent value="symbols" className="space-y-2">
            <div className="grid grid-cols-8 gap-2">
              {symbols.map((symbol) => (
                <Button
                  key={symbol.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(symbol.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {symbol.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="units" className="space-y-2">
            <div className="grid grid-cols-8 gap-2">
              {units.map((unit) => (
                <Button
                  key={unit.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(unit.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {unit.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="constants" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {constants.map((constant) => (
                <Button
                  key={constant.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(constant.value)}
                  className="h-12 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border text-xs"
                >
                  {constant.display}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="operators" className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {operators.map((operator) => (
                <Button
                  key={operator.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onInsert(operator.value)}
                  className="h-10 bg-prism-surface/20 hover:bg-prism-surface/40 border-prism-border"
                >
                  {operator.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PhysicsKeyboard;
