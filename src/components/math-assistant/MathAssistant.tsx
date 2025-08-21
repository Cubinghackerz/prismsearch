
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sigma, Calculator, Copy, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import EquationKeyboard from './EquationKeyboard';
import MathRenderer from './MathRenderer';

interface MathResult {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
}

const MathAssistant = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<MathResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = input.substring(0, start) + text + input.substring(end);
      setInput(newValue);
      
      // Set cursor position after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + text.length;
          textareaRef.current.selectionEnd = start + text.length;
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const solveMath = async () => {
    if (!input.trim()) {
      toast.error('Please enter a mathematical expression or problem');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://fgpdfkvabwemivzjeitx.supabase.co/functions/v1/math-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncGRma3ZhYndlbWl2emplaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTU5ODUsImV4cCI6MjA2MTczMTk4NX0.hbWiDq1_KGBMMmQBbsrZTysKxUm3bqjslSqRUzre-O4`,
        },
        body: JSON.stringify({ problem: input }),
      });

      if (!response.ok) {
        throw new Error(`Failed to solve: ${response.statusText}`);
      }

      const data = await response.json();
      
      const newResult: MathResult = {
        id: Date.now().toString(),
        input: input,
        output: data.solution,
        timestamp: new Date(),
      };

      setResults(prev => [newResult, ...prev]);
      setInput('');
      toast.success('Math problem solved!');
    } catch (error) {
      console.error('Error solving math:', error);
      toast.error('Failed to solve the mathematical problem');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearResults = () => {
    setResults([]);
    toast.success('Results cleared');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      solveMath();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Sigma className="h-8 w-8 text-prism-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
            Math Assistant
          </h1>
        </div>
        <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
          Advanced mathematical problem solver powered by Gemini 2.5 Flash. 
          Solve equations, calculus, algebra, statistics, and more with step-by-step solutions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-prism-surface/50 border-prism-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Mathematical Input</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter your mathematical expression or problem here...
Examples:
• Solve: x^2 + 5x - 6 = 0
• Integrate: ∫ x^2 dx
• Derive: d/dx(sin(x) * cos(x))
• Calculate: lim(x→0) sin(x)/x"
              className="min-h-[200px] bg-prism-surface/30 border-prism-border text-prism-text resize-none"
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-prism-text-muted">
                Use Ctrl+Enter to solve quickly
              </div>
              <Button 
                onClick={solveMath} 
                disabled={isLoading || !input.trim()}
                className="bg-prism-primary hover:bg-prism-primary/90"
              >
                {isLoading ? (
                  <>Solving...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Solve Problem
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-prism-surface/50 border-prism-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Solutions & Results</CardTitle>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearResults}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {results.length === 0 ? (
                <div className="text-center text-prism-text-muted py-12">
                  <Sigma className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No solutions yet. Enter a mathematical problem to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={result.id} className="space-y-2">
                      <div className="bg-prism-surface/30 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-prism-text-muted">
                            Problem #{results.length - index}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyResult(result.output)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-prism-accent">Input:</div>
                          <MathRenderer content={result.input} />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-prism-primary">Solution:</div>
                          <MathRenderer content={result.output} />
                        </div>
                        
                        <div className="text-xs text-prism-text-muted">
                          {result.timestamp.toLocaleString()}
                        </div>
                      </div>
                      {index < results.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Equation Keyboard */}
      <EquationKeyboard onInsert={insertAtCursor} />
    </div>
  );
};

export default MathAssistant;
