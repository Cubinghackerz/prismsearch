
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChemistryKeyboardProps {
  onInsert: (text: string) => void;
}

const ChemistryKeyboard: React.FC<ChemistryKeyboardProps> = ({ onInsert }) => {
  const elements = [
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr'
  ];

  const subscripts = [
    '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₊', '₋', '₌', '₍', '₎'
  ];

  const superscripts = [
    '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻', '⁼', '⁽', '⁾'
  ];

  const symbols = [
    '→', '←', '↔', '⇌', '↑', '↓', '∆', '°', '•', '≡', '≈', '±', '∓', '∝', '∞', '∂', '∇', '∑', '∏', '∫'
  ];

  const bonds = [
    '—', '=', '≡', ':', '∴', '∵', '⋅', '×', '÷', '√', '∛'
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
        <CardTitle className="text-lg font-semibold text-prism-text">Chemistry Keyboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-prism-surface/30">
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="subscripts">Subscripts</TabsTrigger>
            <TabsTrigger value="superscripts">Superscripts</TabsTrigger>
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
          </TabsList>
          
          <TabsContent value="elements" className="mt-4">
            {renderButtonGroup(elements, "Chemical Elements")}
          </TabsContent>
          
          <TabsContent value="subscripts" className="mt-4">
            {renderButtonGroup(subscripts, "Subscript Numbers & Symbols")}
          </TabsContent>
          
          <TabsContent value="superscripts" className="mt-4">
            {renderButtonGroup(superscripts, "Superscript Numbers & Symbols")}
          </TabsContent>
          
          <TabsContent value="symbols" className="mt-4">
            {renderButtonGroup(symbols, "Chemical Symbols")}
          </TabsContent>
          
          <TabsContent value="bonds" className="mt-4">
            {renderButtonGroup(bonds, "Chemical Bonds & Operations")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChemistryKeyboard;
