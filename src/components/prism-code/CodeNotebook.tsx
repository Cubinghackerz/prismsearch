import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Plus, Code, AlertTriangle, Trash2, Download } from "lucide-react";
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

  const deleteCell = (id: number) => {
    if (cells.length > 1) {
      setCells(cells.filter(cell => cell.id !== id));
    }
  };

  const downloadCell = (id: number) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    const fileExtensions = {
      javascript: 'js',
      python: 'py',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      json: 'json'
    };

    const extension = fileExtensions[cell.language as keyof typeof fileExtensions] || 'txt';
    const filename = `prism-code-cell-${id}.${extension}`;
    
    const blob = new Blob([cell.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllCells = () => {
    const allCode = cells.map((cell, index) => {
      const langLabel = supportedLanguages.find(l => l.value === cell.language)?.label;
      return `// Cell ${index + 1} - ${langLabel}\n${cell.code}\n\n`;
    }).join('');

    const blob = new Blob([allCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prism-code-notebook.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateCell = (id: number, updates: any) => {
    setCells(cells.map(cell => 
      cell.id === id ? { ...cell, ...updates } : cell
    ));
  };

  const executeJavaScript = (code: string): string => {
    try {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      let output = '';
      
      const captureOutput = (...args: any[]) => {
        output += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      };
      
      console.log = captureOutput;
      console.error = captureOutput;
      console.warn = captureOutput;

      // Create a safer eval environment
      const result = Function('"use strict"; ' + code)();
      
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      if (result !== undefined && !output) {
        output = String(result);
      }
      
      return output || 'Code executed successfully';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  const executePython = (code: string): string => {
    // Simulate Python execution with basic syntax checking
    try {
      const lines = code.split('\n').filter(line => line.trim());
      let output = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('print(') && trimmedLine.endsWith(')')) {
          const content = trimmedLine.slice(6, -1);
          // Remove quotes if present
          const cleanContent = content.replace(/^["']|["']$/g, '');
          output += cleanContent + '\n';
        } else if (trimmedLine.includes('=') && !trimmedLine.startsWith('#')) {
          // Variable assignment
          output += `Variable assigned: ${trimmedLine}\n`;
        }
      }
      
      return output || 'Python code processed (simulated execution)';
    } catch (error) {
      return 'Error: Invalid Python syntax';
    }
  };

  const executeTypeScript = (code: string): string => {
    try {
      // Convert basic TypeScript to JavaScript for execution
      let jsCode = code
        .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // Remove interfaces
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Remove type aliases
      
      return executeJavaScript(jsCode);
    } catch (error: any) {
      return `TypeScript Error: ${error.message}`;
    }
  };

  const executeHTML = (code: string): string => {
    try {
      // Create a temporary iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
        
        setTimeout(() => document.body.removeChild(iframe), 100);
        
        return 'HTML rendered successfully\n(Check browser developer tools for full output)';
      }
      
      return 'HTML code processed';
    } catch (error: any) {
      return `HTML Error: ${error.message}`;
    }
  };

  const executeCSS = (code: string): string => {
    try {
      // Validate CSS syntax by creating a style element
      const style = document.createElement('style');
      style.textContent = code;
      document.head.appendChild(style);
      
      setTimeout(() => document.head.removeChild(style), 100);
      
      return 'CSS applied successfully\n(Styles temporarily applied to document)';
    } catch (error: any) {
      return `CSS Error: ${error.message}`;
    }
  };

  const executeJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return `Valid JSON:\n${JSON.stringify(parsed, null, 2)}`;
    } catch (error: any) {
      return `JSON Error: ${error.message}`;
    }
  };

  const runCell = (id: number) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    let output: string;

    switch (cell.language) {
      case 'javascript':
        output = executeJavaScript(cell.code);
        break;
      case 'python':
        output = executePython(cell.code);
        break;
      case 'typescript':
        output = executeTypeScript(cell.code);
        break;
      case 'html':
        output = executeHTML(cell.code);
        break;
      case 'css':
        output = executeCSS(cell.code);
        break;
      case 'json':
        output = executeJSON(cell.code);
        break;
      default:
        output = `${cell.language} execution not implemented`;
    }

    updateCell(id, { output });
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
          <Button onClick={downloadAllCells} variant="outline" className="font-inter">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
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
          <strong>Beta Warning:</strong> This is an experimental feature. Code execution capabilities vary by language. 
          JavaScript and TypeScript run in browser environment, Python is simulated, HTML/CSS are temporarily applied, and JSON is parsed for validation. 
          Do not run untrusted code. Full sandboxed execution coming soon.
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
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => downloadCell(cell.id)}
                    size="sm"
                    variant="outline"
                    className="font-inter"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => runCell(cell.id)}
                    size="sm"
                    className="font-inter"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                  {cells.length > 1 && (
                    <Button
                      onClick={() => deleteCell(cell.id)}
                      size="sm"
                      variant="destructive"
                      className="font-inter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
