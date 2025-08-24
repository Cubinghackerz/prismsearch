import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ScientificCalculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState('');
  const [firstValue, setFirstValue] = useState('');

  const handleNumberClick = (number: string) => {
    setDisplayValue(displayValue === '0' ? number : displayValue + number);
  };

  const handleOperatorClick = (operatorValue: string) => {
    setOperator(operatorValue);
    setFirstValue(displayValue);
    setDisplayValue('0');
  };

  const handleEqualClick = () => {
    const num1 = parseFloat(firstValue);
    const num2 = parseFloat(displayValue);

    let result = 0;

    switch (operator) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        result = num1 - num2;
        break;
      case '*':
        result = num1 * num2;
        break;
      case '/':
        result = num1 / num2;
        break;
      default:
        return;
    }

    setDisplayValue(result.toString());
    setOperator('');
    setFirstValue('');
  };

  const handleClearClick = () => {
    setDisplayValue('0');
    setOperator('');
    setFirstValue('');
  };

  const handleDecimalClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleSignChange = () => {
    setDisplayValue((parseFloat(displayValue) * -1).toString());
  };

  const handlePercentageClick = () => {
    setDisplayValue((parseFloat(displayValue) / 100).toString());
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scientific Calculator</span>
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            Experimental
          </Badge>
        </CardTitle>
        <CardDescription>
          Advanced mathematical calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          className="text-right text-2xl font-mono mb-4"
          value={displayValue}
          readOnly
        />
        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" onClick={handleClearClick}>C</Button>
          <Button variant="secondary" onClick={handleSignChange}>+/-</Button>
          <Button variant="secondary" onClick={handlePercentageClick}>%</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('/')}>/</Button>

          <Button onClick={() => handleNumberClick('7')}>7</Button>
          <Button onClick={() => handleNumberClick('8')}>8</Button>
          <Button onClick={() => handleNumberClick('9')}>9</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('*')}>*</Button>

          <Button onClick={() => handleNumberClick('4')}>4</Button>
          <Button onClick={() => handleNumberClick('5')}>5</Button>
          <Button onClick={() => handleNumberClick('6')}>6</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('-')}>-</Button>

          <Button onClick={() => handleNumberClick('1')}>1</Button>
          <Button onClick={() => handleNumberClick('2')}>2</Button>
          <Button onClick={() => handleNumberClick('3')}>3</Button>
          <Button variant="outline" onClick={() => handleOperatorClick('+')}>+</Button>

          <Button onClick={() => handleNumberClick('0')}>0</Button>
          <Button onClick={handleDecimalClick}>.</Button>
          <Button className="col-span-2" onClick={handleEqualClick}>=</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScientificCalculator;
