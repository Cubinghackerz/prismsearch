
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Atom, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PhysicsKeyboard from './PhysicsKeyboard';
import { toast } from 'sonner';

const PhysicsAssistant = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!problem.trim()) {
      toast.error('Please enter a physics problem');
      return;
    }

    setIsLoading(true);
    setSolution('');

    try {
      const { data, error } = await supabase.functions.invoke('physics-assistant', {
        body: { problem }
      });

      if (error) {
        console.error('Physics assistant error:', error);
        toast.error('Failed to solve physics problem');
        return;
      }

      setSolution(data.solution);
      toast.success('Physics problem solved successfully!');
    } catch (error) {
      console.error('Error calling physics assistant:', error);
      toast.error('An error occurred while solving the problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = problem.slice(0, start) + symbol + problem.slice(end);
      setProblem(newValue);
      
      // Set cursor position after inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Atom className="h-8 w-8 text-prism-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
            Physics Assistant
          </h1>
        </div>
        <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
          Solve complex physics problems with advanced AI reasoning. Get step-by-step solutions with detailed explanations.
        </p>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Powered by Qwen3-235B-A22B-Thinking-2507
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="bg-prism-surface/50 border-prism-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Enter Physics Problem</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Enter your physics problem here... (e.g., A ball is thrown vertically upward with an initial velocity of 20 m/s. Calculate the maximum height reached.)"
                className="min-h-[200px] bg-prism-surface/30 border-prism-border resize-none"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !problem.trim()}
                className="w-full bg-prism-primary hover:bg-prism-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Solving Problem...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Solve Physics Problem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <PhysicsKeyboard onInsert={handleInsertSymbol} />
        </div>

        <div>
          <Card className="bg-prism-surface/50 border-prism-border h-full">
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-prism-primary" />
                      <p className="text-prism-text-muted">Analyzing physics problem...</p>
                    </div>
                  </div>
                ) : solution ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-prism-text">
                      {solution}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-prism-text-muted">
                    Enter a physics problem to get started
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhysicsAssistant;
