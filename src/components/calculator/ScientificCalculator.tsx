import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Trash2 } from 'lucide-react';

interface ScientificCalculatorProps {
  type?: string;
}

const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ type }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performFunction = (func: string) => {
    const value = parseFloat(display);
    let result = 0;

    switch (func) {
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'factorial':
        result = factorial(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForNewValue(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-prism-surface/50 border-prism-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-prism-primary" />
            <span>Scientific Calculator</span>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Experimental
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-prism-surface/30 border border-prism-border rounded-lg p-4">
          <div className="text-right text-2xl font-mono text-prism-text overflow-hidden">
            {display}
          </div>
        </div>

        {/* Function buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => performFunction('sin')} className="text-sm">
            sin
          </Button>
          <Button variant="outline" onClick={() => performFunction('cos')} className="text-sm">
            cos
          </Button>
          <Button variant="outline" onClick={() => performFunction('tan')} className="text-sm">
            tan
          </Button>
          <Button variant="outline" onClick={() => performFunction('log')} className="text-sm">
            log
          </Button>
          <Button variant="outline" onClick={() => performFunction('ln')} className="text-sm">
            ln
          </Button>
          <Button variant="outline" onClick={() => performFunction('sqrt')} className="text-sm">
            √
          </Button>
          <Button variant="outline" onClick={() => performFunction('square')} className="text-sm">
            x²
          </Button>
          <Button variant="outline" onClick={() => performFunction('factorial')} className="text-sm">
            x!
          </Button>
          <Button variant="outline" onClick={() => performFunction('pi')} className="text-sm">
            π
          </Button>
          <Button variant="outline" onClick={() => performFunction('e')} className="text-sm">
            e
          </Button>
          <Button variant="outline" onClick={clearEntry} className="text-sm">
            CE
          </Button>
          <Button variant="outline" onClick={clearDisplay} className="text-sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Number and operation buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
          <Button variant="outline" onClick={() => inputOperation('/')} className="bg-prism-primary/20">÷</Button>
          
          <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
          <Button variant="outline" onClick={() => inputOperation('*')} className="bg-prism-primary/20">×</Button>
          
          <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
          <Button variant="outline" onClick={() => inputOperation('-')} className="bg-prism-primary/20">−</Button>
          
          <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">0</Button>
          <Button variant="outline" onClick={() => inputNumber('.')}>.</Button>
          <Button variant="outline" onClick={() => inputOperation('+')} className="bg-prism-primary/20">+</Button>
        </div>

        <Button 
          onClick={() => inputOperation('=')} 
          className="w-full bg-prism-primary hover:bg-prism-primary/90"
        >
          =
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScientificCalculator;
