
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, History, Trash2 } from 'lucide-react';

interface CalculatorProps {
  type: 'math' | 'physics' | 'chemistry';
}

const ScientificCalculator: React.FC<CalculatorProps> = ({ type }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result = 0;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = currentValue / inputValue;
          break;
        case '^':
          result = Math.pow(currentValue, inputValue);
          break;
        default:
          return;
      }

      const calculation = `${currentValue} ${operation} ${inputValue} = ${result}`;
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    performOperation('=');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNewValue(true);
  };

  const performFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result = 0;

    switch (func) {
      case 'sin':
        result = Math.sin((inputValue * Math.PI) / 180);
        break;
      case 'cos':
        result = Math.cos((inputValue * Math.PI) / 180);
        break;
      case 'tan':
        result = Math.tan((inputValue * Math.PI) / 180);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'x²':
        result = inputValue * inputValue;
        break;
      default:
        return;
    }

    const calculation = `${func}(${inputValue}) = ${result}`;
    setHistory(prev => [calculation, ...prev.slice(0, 9)]);
    setDisplay(String(result));
    setWaitingForNewValue(true);
  };

  const insertConstant = (constant: string) => {
    let value = '';
    switch (constant) {
      case 'π':
        value = String(Math.PI);
        break;
      case 'e':
        value = String(Math.E);
        break;
      case 'c':
        value = '299792458'; // Speed of light in m/s
        break;
      case 'g':
        value = '9.81'; // Gravitational acceleration
        break;
      case 'h':
        value = '6.626e-34'; // Planck constant
        break;
      case 'R':
        value = '8.314'; // Gas constant
        break;
      default:
        return;
    }
    setDisplay(value);
    setWaitingForNewValue(true);
  };

  const getTypeSpecificButtons = () => {
    switch (type) {
      case 'physics':
        return (
          <>
            <Button variant="outline" onClick={() => insertConstant('c')} className="text-xs">
              c
            </Button>
            <Button variant="outline" onClick={() => insertConstant('g')} className="text-xs">
              g
            </Button>
            <Button variant="outline" onClick={() => insertConstant('h')} className="text-xs">
              h
            </Button>
          </>
        );
      case 'chemistry':
        return (
          <>
            <Button variant="outline" onClick={() => insertConstant('R')} className="text-xs">
              R
            </Button>
            <Button variant="outline" onClick={() => performFunction('log')} className="text-xs">
              log
            </Button>
            <Button variant="outline" onClick={() => performFunction('ln')} className="text-xs">
              ln
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button variant="outline" onClick={() => performFunction('x²')} className="text-xs">
              x²
            </Button>
            <Button variant="outline" onClick={() => performFunction('1/x')} className="text-xs">
              1/x
            </Button>
            <Button variant="outline" onClick={() => performOperation('^')} className="text-xs">
              x^y
            </Button>
          </>
        );
    }
  };

  return (
    <Card className="w-full max-w-md bg-prism-surface/50 border-prism-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Scientific Calculator</span>
          <Badge variant="secondary" className="ml-auto">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-prism-surface/30 p-4 rounded-lg border border-prism-border">
          <div className="text-right text-2xl font-mono text-prism-text break-all">
            {display}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-prism-surface/20 p-2 rounded-lg border border-prism-border max-h-20 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-xs text-prism-text-muted">
                <History className="h-3 w-3 mr-1" />
                History
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistory([])}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {history.slice(0, 3).map((calc, index) => (
              <div key={index} className="text-xs text-prism-text-muted font-mono">
                {calc}
              </div>
            ))}
          </div>
        )}

        {/* Function Buttons */}
        <div className="grid grid-cols-6 gap-2">
          <Button variant="outline" onClick={() => performFunction('sin')} className="text-xs">
            sin
          </Button>
          <Button variant="outline" onClick={() => performFunction('cos')} className="text-xs">
            cos
          </Button>
          <Button variant="outline" onClick={() => performFunction('tan')} className="text-xs">
            tan
          </Button>
          <Button variant="outline" onClick={() => performFunction('log')} className="text-xs">
            log
          </Button>
          <Button variant="outline" onClick={() => performFunction('ln')} className="text-xs">
            ln
          </Button>
          <Button variant="outline" onClick={() => performFunction('sqrt')} className="text-xs">
            √
          </Button>
        </div>

        {/* Constants and Type-specific */}
        <div className="grid grid-cols-6 gap-2">
          <Button variant="outline" onClick={() => insertConstant('π')} className="text-xs">
            π
          </Button>
          <Button variant="outline" onClick={() => insertConstant('e')} className="text-xs">
            e
          </Button>
          {getTypeSpecificButtons()}
        </div>

        {/* Main Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="destructive" onClick={clear}>
            C
          </Button>
          <Button variant="outline" onClick={() => performOperation('/')}>
            ÷
          </Button>
          <Button variant="outline" onClick={() => performOperation('*')}>
            ×
          </Button>
          <Button variant="outline" onClick={() => performOperation('-')}>
            -
          </Button>

          <Button variant="outline" onClick={() => inputNumber('7')}>
            7
          </Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>
            8
          </Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>
            9
          </Button>
          <Button variant="outline" onClick={() => performOperation('+')} className="row-span-2">
            +
          </Button>

          <Button variant="outline" onClick={() => inputNumber('4')}>
            4
          </Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>
            5
          </Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>
            6
          </Button>

          <Button variant="outline" onClick={() => inputNumber('1')}>
            1
          </Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>
            2
          </Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>
            3
          </Button>
          <Button className="row-span-2 bg-prism-primary hover:bg-prism-primary/90" onClick={calculate}>
            =
          </Button>

          <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">
            0
          </Button>
          <Button variant="outline" onClick={inputDot}>
            .
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScientificCalculator;
