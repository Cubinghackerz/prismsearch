
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom, Copy, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import PhysicsKeyboard from './PhysicsKeyboard';
import MathRenderer from '../math-assistant/MathRenderer';
import ScientificCalculator from '../calculator/ScientificCalculator';
import FileUpload from '../chat/FileUpload';

interface PhysicsResult {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
  attachments?: any[];
}

const PhysicsAssistant = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<PhysicsResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = input.substring(0, start) + text + input.substring(end);
      setInput(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + text.length;
          textareaRef.current.selectionEnd = start + text.length;
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const solvePhysics = async () => {
    if (!input.trim()) {
      toast.error('Please enter a physics problem');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://fgpdfkvabwemivzjeitx.supabase.co/functions/v1/physics-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncGRma3ZhYndlbWl2emplaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTU5ODUsImV4cCI6MjA2MTczMTk4NX0.hbWiDq1_KGBMMmQBbsrZTysKxUm3bqjslSqRUzre-O4`,
        },
        body: JSON.stringify({ 
          problem: input,
          attachments: attachedFiles
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to solve: ${response.statusText}`);
      }

      const data = await response.json();
      
      const newResult: PhysicsResult = {
        id: Date.now().toString(),
        input: input,
        output: data.solution,
        timestamp: new Date(),
        attachments: attachedFiles,
      };

      setResults(prev => [newResult, ...prev]);
      setInput('');
      setAttachedFiles([]);
      toast.success('Physics problem solved!');
    } catch (error) {
      console.error('Error solving physics:', error);
      toast.error('Failed to solve the physics problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAdd = (file: any) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  const handleFileRemove = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
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
      solvePhysics();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Atom className="h-8 w-8 text-prism-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
            Physics Assistant
          </h1>
        </div>
        <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
          Advanced physics problem solver powered by Gemini 2.5 Pro. 
          Solve mechanics, thermodynamics, electromagnetism, quantum physics, and more with detailed solutions.
        </p>
      </div>

      <Tabs defaultValue="solver" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solver">Problem Solver</TabsTrigger>
          <TabsTrigger value="calculator">Scientific Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="solver" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-prism-surface/50 border-prism-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Atom className="h-5 w-5" />
                  <span>Physics Problem Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your physics problem here...
Examples:
• A 2kg block slides down a 30° incline with friction coefficient μ = 0.2
• Calculate the electric field at point P due to two charges
• Find the wavelength of light with frequency 5 × 10¹⁴ Hz
• Determine the momentum of a photon with energy 2.5 eV"
                  className="min-h-[200px] bg-prism-surface/30 border-prism-border text-prism-text resize-none"
                />
                
                <div className="mt-3">
                  <FileUpload
                    attachedFiles={attachedFiles}
                    onFileAdd={handleFileAdd}
                    onFileRemove={handleFileRemove}
                    disabled={isLoading}
                    maxFiles={3}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-prism-text-muted">
                    Use Ctrl+Enter to solve quickly
                  </div>
                  <Button 
                    onClick={solvePhysics} 
                    disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
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
                      <Atom className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No solutions yet. Enter a physics problem to get started!</p>
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
                            
                            {result.output.includes('**ANSWER:**') && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-emerald-400">Answer:</div>
                                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3">
                                    <MathRenderer content={result.output.split('**ANSWER:**')[1]?.split('**SOLUTION:**')[0]?.trim() || 'No answer found'} />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-prism-primary">Solution:</div>
                              <MathRenderer content={result.output.includes('**SOLUTION:**') ? result.output.split('**SOLUTION:**')[1]?.trim() || result.output : result.output} />
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

          <PhysicsKeyboard onInsert={insertAtCursor} />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="flex justify-center">
            <ScientificCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhysicsAssistant;
