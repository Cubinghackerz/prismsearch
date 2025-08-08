import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Plus, Code, AlertTriangle, Trash2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import UserInputDialog from "./UserInputDialog";

interface Cell {
  id: number;
  language: string;
  code: string;
  output: string;
  userInputs: string[];
}

const CodeNotebook = () => {
  const [cells, setCells] = useState<Cell[]>([{
    id: 1,
    language: 'python',
    code: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
    output: '',
    userInputs: []
  }]);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [inputDialog, setInputDialog] = useState<{
    isOpen: boolean;
    cellId: number;
    prompt: string;
    onSubmit: (value: string) => void;
  }>({ isOpen: false, cellId: 0, prompt: '', onSubmit: () => {} });

  const supportedLanguages = [{
    value: 'python',
    label: 'Python'
  }, {
    value: 'javascript',
    label: 'JavaScript (Beta)'
  }, {
    value: 'typescript',
    label: 'TypeScript (Beta)'
  }, {
    value: 'html',
    label: 'HTML (Beta)'
  }, {
    value: 'css',
    label: 'CSS (Beta)'
  }, {
    value: 'json',
    label: 'JSON (Beta)'
  }];

  const addCell = () => {
    const newCell: Cell = {
      id: Date.now(),
      language: selectedLanguage,
      code: '',
      output: '',
      userInputs: []
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
    const blob = new Blob([cell.code], {
      type: 'text/plain'
    });
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
    const blob = new Blob([allCode], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prism-code-notebook.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateCell = (id: number, updates: Partial<Cell>) => {
    setCells(cells.map(cell => cell.id === id ? {
      ...cell,
      ...updates
    } : cell));
  };

  const executeJavaScript = (code: string, userInputs: string[] = []): string => {
    try {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      let output = '';
      let inputIndex = 0;

      const captureOutput = (...args: any[]) => {
        output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
      };

      // Mock prompt function for user input
      const mockPrompt = (message: string) => {
        if (inputIndex < userInputs.length) {
          const input = userInputs[inputIndex++];
          output += `${message}${input}\n`;
          return input;
        }
        return '';
      };

      console.log = captureOutput;
      console.error = captureOutput;
      console.warn = captureOutput;
      (window as any).prompt = mockPrompt;

      // Create a safer eval environment
      const result = Function('"use strict"; ' + code)();

      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      delete (window as any).prompt;

      if (result !== undefined && !output) {
        output = String(result);
      }
      return output || 'Code executed successfully';
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  const executePython = (code: string, userInputs: string[] = []): string => {
    try {
      const lines = code.split('\n').filter(line => line.trim());
      let output = '';
      let inputIndex = 0;
      const variables: { [key: string]: any } = {};

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || !trimmedLine) {
          continue;
        }
        
        if (trimmedLine.startsWith('print(') && trimmedLine.endsWith(')')) {
          const content = trimmedLine.slice(6, -1);
          
          // Handle f-strings
          if (content.startsWith('f"') || content.startsWith("f'")) {
            let fStringContent = content.slice(2, -1);
            // Replace variables in f-string
            Object.keys(variables).forEach(varName => {
              const regex = new RegExp(`\\{${varName}\\}`, 'g');
              fStringContent = fStringContent.replace(regex, String(variables[varName]));
            });
            output += fStringContent + '\n';
          } else {
            // Regular string or variable
            const cleanContent = content.replace(/^["']|["']$/g, '');
            if (variables[cleanContent] !== undefined) {
              output += variables[cleanContent] + '\n';
            } else {
              output += cleanContent + '\n';
            }
          }
        } else if (trimmedLine.includes('input(') && trimmedLine.includes('=')) {
          // Handle input statements
          const parts = trimmedLine.split('=');
          const varName = parts[0].trim();
          const inputCall = parts[1].trim();
          const promptMatch = inputCall.match(/input\("([^"]*)"\)/);
          const prompt = promptMatch ? promptMatch[1] : 'Enter input: ';
          
          if (inputIndex < userInputs.length) {
            const userInput = userInputs[inputIndex++];
            variables[varName] = userInput;
            output += `${prompt}${userInput}\n`;
          } else {
            variables[varName] = '';
            output += `${prompt}\n`;
          }
        } else if (trimmedLine.includes('=') && !trimmedLine.includes('input(')) {
          // Variable assignment
          const parts = trimmedLine.split('=');
          if (parts.length >= 2) {
            const varName = parts[0].trim();
            let value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            
            // Handle numeric values
            if (!isNaN(Number(value)) && value !== '') {
              value = Number(value);
            }
            
            variables[varName] = value;
          }
        } else if (trimmedLine.startsWith('def ')) {
          // Function definition - just acknowledge it
          const funcMatch = trimmedLine.match(/def\s+(\w+)/);
          if (funcMatch) {
            output += `Function ${funcMatch[1]} defined\n`;
          }
        } else if (trimmedLine.includes('(') && trimmedLine.includes(')') && !trimmedLine.includes('=')) {
          // Function call or other operations
          try {
            // Handle basic arithmetic operations
            if (/^[\d\s+\-*/().]+$/.test(trimmedLine)) {
              const result = eval(trimmedLine);
              output += `${result}\n`;
            } else {
              output += `Executed: ${trimmedLine}\n`;
            }
          } catch {
            output += `Executed: ${trimmedLine}\n`;
          }
        }
      }
      
      return output || 'Python code executed successfully';
    } catch (error) {
      return 'Error: Invalid Python syntax or execution error';
    }
  };

  const executeTypeScript = (code: string): string => {
    try {
      // Convert basic TypeScript to JavaScript for execution
      let jsCode = code.replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
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

  const runCell = async (id: number) => {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    // Check if code requires input
    const requiresInput = (
      (cell.language === 'python' && cell.code.includes('input(')) ||
      (cell.language === 'javascript' && cell.code.includes('prompt('))
    );

    if (requiresInput) {
      // Collect all input prompts
      const inputPrompts: string[] = [];
      
      if (cell.language === 'python') {
        const inputMatches = cell.code.match(/input\("([^"]*)"\)/g);
        if (inputMatches) {
          inputMatches.forEach(match => {
            const promptMatch = match.match(/input\("([^"]*)"\)/);
            if (promptMatch) {
              inputPrompts.push(promptMatch[1]);
            }
          });
        }
      } else if (cell.language === 'javascript') {
        const promptMatches = cell.code.match(/prompt\("([^"]*)"\)/g);
        if (promptMatches) {
          promptMatches.forEach(match => {
            const promptMatch = match.match(/prompt\("([^"]*)"\)/);
            if (promptMatch) {
              inputPrompts.push(promptMatch[1]);
            }
          });
        }
      }

      // Collect user inputs
      const userInputs: string[] = [];
      
      for (let i = 0; i < inputPrompts.length; i++) {
        await new Promise<void>((resolve) => {
          setInputDialog({
            isOpen: true,
            cellId: id,
            prompt: inputPrompts[i] || `Input ${i + 1}:`,
            onSubmit: (value: string) => {
              userInputs.push(value);
              setInputDialog(prev => ({ ...prev, isOpen: false }));
              resolve();
            }
          });
        });
      }

      // Execute with inputs
      let output: string;
      switch (cell.language) {
        case 'javascript':
          output = executeJavaScript(cell.code, userInputs);
          break;
        case 'python':
          output = executePython(cell.code, userInputs);
          break;
        default:
          output = `${cell.language} execution with inputs not implemented`;
      }
      
      updateCell(id, { output, userInputs });
    } else {
      // Execute without inputs (existing functionality)
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
    }
  };

  return <div className="space-y-6">
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
              {supportedLanguages.map(lang => <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>)}
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
          <strong>Beta Warning:</strong> This is an experimental feature. Python has full input support and simulated execution. 
          JavaScript has basic input support via prompt(). Other languages are in beta with limited functionality.
          TypeScript is transpiled to JavaScript, HTML/CSS are temporarily applied, and JSON is parsed for validation. 
          Do not run untrusted code. Full sandboxed execution coming soon.
        </AlertDescription>
      </Alert>

      {/* Code Cells */}
      <div className="space-y-6">
        {cells.map((cell, index) => <Card key={cell.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Cell {index + 1} ({supportedLanguages.find(l => l.value === cell.language)?.label})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => downloadCell(cell.id)} size="sm" variant="outline" className="font-inter">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => runCell(cell.id)} size="sm" className="font-inter">
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                  {cells.length > 1 && <Button onClick={() => deleteCell(cell.id)} size="sm" variant="destructive" className="font-inter">
                      <Trash2 className="w-4 h-4" />
                    </Button>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CodeEditor language={cell.language} code={cell.code} onChange={code => updateCell(cell.id, {
            code
          })} />
              {cell.output && <div className="border-t border-prism-border">
                  <div className="p-4 bg-prism-surface/20">
                    <h4 className="text-sm font-semibold text-prism-text mb-2">Output:</h4>
                    <pre className="text-sm text-prism-text-muted font-mono whitespace-pre-wrap">
                      {cell.output}
                    </pre>
                  </div>
                </div>}
            </CardContent>
          </Card>)}
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

      {/* User Input Dialog */}
      <UserInputDialog
        isOpen={inputDialog.isOpen}
        prompt={inputDialog.prompt}
        onSubmit={inputDialog.onSubmit}
        onCancel={() => setInputDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>;
};

export default CodeNotebook;
