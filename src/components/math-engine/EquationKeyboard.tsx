import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type MathEngineCommand = 'freeform' | 'factorise' | 'expand' | 'graph2D' | 'graph3D';

interface EquationKeyboardProps {
  onInsert: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  command: MathEngineCommand;
}

interface KeyboardKey {
  label: string;
  insert: string;
}

interface KeyboardSection {
  id: string;
  label: string;
  keys: KeyboardKey[];
}

const BASE_SECTIONS: KeyboardSection[] = [
  {
    id: 'numbers',
    label: 'Numbers',
    keys: [
      { label: '7', insert: '7' },
      { label: '8', insert: '8' },
      { label: '9', insert: '9' },
      { label: '4', insert: '4' },
      { label: '5', insert: '5' },
      { label: '6', insert: '6' },
      { label: '1', insert: '1' },
      { label: '2', insert: '2' },
      { label: '3', insert: '3' },
      { label: '0', insert: '0' },
      { label: '.', insert: '.' },
      { label: ',', insert: ',' },
    ],
  },
  {
    id: 'basics',
    label: 'Basics',
    keys: [
      { label: '+', insert: ' + ' },
      { label: '−', insert: ' - ' },
      { label: '×', insert: ' * ' },
      { label: '÷', insert: ' / ' },
      { label: '=', insert: ' = ' },
      { label: '(', insert: '(' },
      { label: ')', insert: ')' },
      { label: '[', insert: '[' },
      { label: ']', insert: ']' },
      { label: '{', insert: '{' },
      { label: '}', insert: '}' },
      { label: '|x|', insert: 'abs()' },
    ],
  },
  {
    id: 'algebra',
    label: 'Algebra',
    keys: [
      { label: 'x', insert: 'x' },
      { label: 'y', insert: 'y' },
      { label: 'z', insert: 'z' },
      { label: '^', insert: '^' },
      { label: 'x²', insert: '^2' },
      { label: '√', insert: 'sqrt()' },
      { label: '³√', insert: 'cbrt()' },
      { label: 'n!', insert: 'factorial()' },
      { label: 'nCr', insert: 'nCr()' },
      { label: 'nPr', insert: 'nPr()' },
      { label: '→', insert: ' -> ' },
      { label: '∞', insert: 'Infinity' },
    ],
  },
];

const FUNCTION_SECTIONS: KeyboardSection[] = [
  {
    id: 'trig',
    label: 'Trig',
    keys: [
      { label: 'sin', insert: 'sin()' },
      { label: 'cos', insert: 'cos()' },
      { label: 'tan', insert: 'tan()' },
      { label: 'sec', insert: 'sec()' },
      { label: 'csc', insert: 'csc()' },
      { label: 'cot', insert: 'cot()' },
      { label: 'sin⁻¹', insert: 'asin()' },
      { label: 'cos⁻¹', insert: 'acos()' },
      { label: 'tan⁻¹', insert: 'atan()' },
    ],
  },
  {
    id: 'exponential',
    label: 'Expo & Log',
    keys: [
      { label: 'e', insert: 'e' },
      { label: 'eˣ', insert: 'exp()' },
      { label: 'ln', insert: 'ln()' },
      { label: 'log₁₀', insert: 'log10()' },
      { label: 'log', insert: 'log()' },
      { label: 'mod', insert: 'mod()' },
      { label: 'min', insert: 'min()' },
      { label: 'max', insert: 'max()' },
    ],
  },
];

const CALCULUS_SECTIONS: KeyboardSection[] = [
  {
    id: 'calc',
    label: 'Calculus',
    keys: [
      { label: 'd/dx', insert: 'diff( , x)' },
      { label: '∫', insert: 'integrate( , x)' },
      { label: '∮', insert: 'oint( , x)' },
      { label: 'lim', insert: 'limit( , x , )' },
      { label: 'Σ', insert: 'sum( , k, , )' },
      { label: 'Π', insert: 'prod( , k, , )' },
      { label: 'Series', insert: 'series( , x, , )' },
    ],
  },
];

const STATISTICS_SECTIONS: KeyboardSection[] = [
  {
    id: 'stats',
    label: 'Statistics',
    keys: [
      { label: 'Σ', insert: 'sum()' },
      { label: 'μ (x̄)', insert: 'mean()' },
      { label: 'σ', insert: 'std()' },
      { label: 'P(A)', insert: 'P()' },
      { label: 'CDF', insert: 'cdf()' },
      { label: 'PDF', insert: 'pdf()' },
      { label: 'Pr{ }', insert: 'Pr()' },
    ],
  },
];

const LINEAR_ALGEBRA_SECTIONS: KeyboardSection[] = [
  {
    id: 'matrix',
    label: 'Matrices',
    keys: [
      { label: '[ ]', insert: '[[]]' },
      { label: 'det', insert: 'det()' },
      { label: 'adj', insert: 'adj()' },
      { label: 'rank', insert: 'rank()' },
      { label: 'T', insert: 'transpose()' },
      { label: '→v', insert: '<,>' },
    ],
  },
];

const CONSTANTS_SECTION: KeyboardSection = {
  id: 'constants',
  label: 'Constants & Units',
  keys: [
    { label: 'π', insert: 'pi' },
    { label: 'φ', insert: 'phi' },
    { label: 'γ', insert: 'EulerGamma' },
    { label: '°', insert: 'deg' },
    { label: 'm', insert: ' m' },
    { label: 's', insert: ' s' },
    { label: 'kg', insert: ' kg' },
    { label: '→', insert: ' -> ' },
  ],
};

const KEYBOARD_CONFIG: Record<MathEngineCommand, KeyboardSection[]> = {
  freeform: [...BASE_SECTIONS, ...FUNCTION_SECTIONS, ...CALCULUS_SECTIONS, ...STATISTICS_SECTIONS, ...LINEAR_ALGEBRA_SECTIONS, CONSTANTS_SECTION],
  factorise: [...BASE_SECTIONS, ...FUNCTION_SECTIONS, CONSTANTS_SECTION],
  expand: [...BASE_SECTIONS, ...FUNCTION_SECTIONS, CONSTANTS_SECTION],
  graph2D: [...BASE_SECTIONS, ...FUNCTION_SECTIONS, CONSTANTS_SECTION],
  graph3D: [...BASE_SECTIONS, ...FUNCTION_SECTIONS, CONSTANTS_SECTION],
};

const EquationKeyboard: React.FC<EquationKeyboardProps> = ({ onInsert, onBackspace, onClear, command }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('numbers');

  const sections = useMemo(() => {
    const layout = KEYBOARD_CONFIG[command];
    return layout.length ? layout : KEYBOARD_CONFIG.freeform;
  }, [command]);

  const activeSection = useMemo(() => sections.find((section) => section.id === activeSectionId) ?? sections[0], [
    activeSectionId,
    sections,
  ]);

  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup type="single" value={activeSection?.id} onValueChange={(value) => value && setActiveSectionId(value)}>
          {sections.map((section) => (
            <ToggleGroupItem
              key={section.id}
              value={section.id}
              className={cn(
                'px-3 py-1 text-xs font-medium uppercase tracking-wide',
                activeSection?.id === section.id ? 'bg-primary/90 text-white' : 'bg-background/80'
              )}
            >
              {section.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onBackspace} className="h-8 px-3 text-xs">
            Backspace
          </Button>
          <Button size="sm" variant="outline" onClick={onClear} className="h-8 px-3 text-xs">
            Clear
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {activeSection?.keys.map((key) => (
          <button
            key={`${activeSection.id}-${key.label}`}
            type="button"
            onClick={() => onInsert(key.insert)}
            className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/60 hover:bg-primary/10"
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EquationKeyboard;
