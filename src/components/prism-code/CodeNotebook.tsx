
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Plus, Code, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";

const CodeNotebook = () => {
  const [cells, setCells] = useState([
    { id: 1, language: 'javascript', code: 'console.log("Hello, Prism Code!");', output: '' }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' }
  ];

  const addCell = () => {
    const newCell = {
      id: Date.now(),
      language: selectedLanguage,
      code: '',
      output: ''
    };
    setCells([...cells, newCell]);
  };

  const updateCell = (id: number, updates: any) => {
    setCells(cells.map(cell => 
      cell.id === id ? { ...cell, ...updates } : cell
    ));
  };

  const runCell = (id: number) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    // Simple JavaScript execution (in real implementation, this would be sandboxed)
    if (cell.language === 'javascript') {
      try {
        // Capture console.log output
        const originalLog = console.log;
        let output = '';
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };

        // Execute the code
        eval(cell.code);
        
        // Restore original console.log
        console.log = originalLog;
        
        updateCell(id, { output: output || 'Code executed successfully' });
      } catch (error) {
        updateCell(id, { output: `Error: ${error.message}` });
      }
    } else {
      updateCell(id, { output: `${cell.language} execution not implemented in beta version` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-prism-primary/10 to-prism-accent/10 border border-prism-primary/20">
            <Code className="w-8 h-8 text-prism-primary" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
                Prism Code
              </h1>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30 font-fira-code">
                Beta
              </span>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Interactive online notebook for coding and experimentation
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addCell} className="font-inter">
            <Plus className="w-4 h-4 mr-2" />
            Add Cell
          </Button>
        </div>
      </div>

      {/* Beta Warning */}
      <Alert className="border-orange-500/30 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-orange-300">
          <strong>Beta Warning:</strong> This is an experimental feature. Code execution is limited and runs in your browser environment. 
          Do not run untrusted code or code that could harm your system. Full sandboxed execution and additional language support coming soon.
        </AlertDescription>
      </Alert>

      {/* Code Cells */}
      <div className="space-y-6">
        {cells.map((cell, index) => (
          <Card key={cell.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Cell {index + 1} ({supportedLanguages.find(l => l.value === cell.language)?.label})
                </CardTitle>
                <Button
                  onClick={() => runCell(cell.id)}
                  size="sm"
                  className="font-inter"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CodeEditor
                language={cell.language}
                code={cell.code}
                onChange={(code) => updateCell(cell.id, { code })}
              />
              {cell.output && (
                <div className="border-t border-prism-border">
                  <div className="p-4 bg-prism-surface/20">
                    <h4 className="text-sm font-semibold text-prism-text mb-2">Output:</h4>
                    <pre className="text-sm text-prism-text-muted font-mono whitespace-pre-wrap">
                      {cell.output}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Terminal Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Terminal</span>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30">
              Coming Soon
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Terminal />
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeNotebook;
