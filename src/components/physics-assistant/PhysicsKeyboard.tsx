
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PhysicsKeyboardProps {
  onInsert: (text: string) => void;
}

const PhysicsKeyboard: React.FC<PhysicsKeyboardProps> = ({ onInsert }) => {
  const symbols = [
    '∞', '∂', '∇', '∆', '∑', '∏', '∫', '√', '∛', '±', '∓', '×', '÷', '≈', '≠', '≤', '≥', '∝', '∴', '∵'
  ];

  const units = [
    'm', 'kg', 's', 'A', 'K', 'mol', 'cd', 'N', 'J', 'W', 'Pa', 'Hz', 'C', 'V', 'Ω', 'F', 'H', 'T', 'Wb', 'lm'
  ];

  const constants = [
    'c', 'h', 'ħ', 'G', 'e', 'mₑ', 'mₚ', 'k_B', 'N_A', 'R', 'ε₀', 'μ₀', 'σ', 'α'
  ];

  const operators = [
    'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'sinh', 'cosh', 'tanh', 'arcsin', 'arccos', 'arctan'
  ];

  const greekLetters = [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'
  ];

  const renderButtonGroup = (items: string[], title: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-prism-text">{title}</h4>
      <div className="grid grid-cols-10 gap-1">
        {items.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onInsert(item)}
            className="h-8 w-8 p-0 text-xs bg-prism-surface/30 border-prism-border hover:bg-prism-surface/50"
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="bg-prism-surface/50 border-prism-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-prism-text">Physics Keyboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="symbols" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-prism-surface/30">
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="constants">Constants</TabsTrigger>
            <TabsTrigger value="operators">Functions</TabsTrigger>
            <TabsTrigger value="greek">Greek</TabsTrigger>
          </TabsList>
          
          <TabsContent value="symbols" className="mt-4">
            {renderButtonGroup(symbols, "Mathematical Symbols")}
          </TabsContent>
          
          <TabsContent value="units" className="mt-4">
            {renderButtonGroup(units, "SI Units")}
          </TabsContent>
          
          <TabsContent value="constants" className="mt-4">
            {renderButtonGroup(constants, "Physical Constants")}
          </TabsContent>
          
          <TabsContent value="operators" className="mt-4">
            {renderButtonGroup(operators, "Mathematical Functions")}
          </TabsContent>
          
          <TabsContent value="greek" className="mt-4">
            {renderButtonGroup(greekLetters, "Greek Letters")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PhysicsKeyboard;
