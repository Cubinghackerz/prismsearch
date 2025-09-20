import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, Play, Trash2, Download, Save, Folder, Terminal, 
  Code, Database, Settings, Globe, Smartphone, Monitor,
  Rocket, Beaker
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'rust' | 'go' | 'java' | 'html' | 'css' | 'sql';
type ExecutionEnvironment = 'browser' | 'node' | 'python-wasm' | 'rust-wasm' | 'container';

interface BetaCell {
  id: string;
  language: SupportedLanguage;
  code: string;
  output: string;
  environment: ExecutionEnvironment;
  isRunning: boolean;
  dependencies?: string[];
}

interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  icon: React.ReactNode;
  color: string;
  environment: ExecutionEnvironment;
  description: string;
  supportsPackages: boolean;
}

const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: 'python',
    name: 'Python',
    icon: <Database className="w-4 h-4" />,
    color: 'from-yellow-500 to-green-500',
    environment: 'python-wasm',
    description: 'Python 3.11 with scientific libraries',
    supportsPackages: true
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: <Globe className="w-4 h-4" />,
    color: 'from-yellow-500 to-orange-500',
    environment: 'browser',
    description: 'Modern ES2023 JavaScript',
    supportsPackages: true
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: <Code className="w-4 h-4" />,
    color: 'from-blue-500 to-indigo-500',
    environment: 'browser',
    description: 'TypeScript with type checking',
    supportsPackages: true
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: <Settings className="w-4 h-4" />,
    color: 'from-orange-500 to-red-500',
    environment: 'rust-wasm',
    description: 'Rust compiled to WebAssembly',
    supportsPackages: false
  },
  {
    id: 'go',
    name: 'Go',
    icon: <Terminal className="w-4 h-4" />,
    color: 'from-cyan-500 to-blue-500',
    environment: 'container',
    description: 'Go with standard library',
    supportsPackages: true
  },
  {
    id: 'html',
    name: 'HTML',
    icon: <Monitor className="w-4 h-4" />,
    color: 'from-orange-500 to-red-500',
    environment: 'browser',
    description: 'HTML with live preview',
    supportsPackages: false
  }
];

const BetaCodeNotebook = () => {
  const [cells, setCells] = useState<BetaCell[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');
  const { toast } = useToast();

  const addCell = () => {
    const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage);
    if (!languageConfig) return;

    const newCell: BetaCell = {
      id: `cell_${Date.now()}`,
      language: selectedLanguage,
      code: getDefaultCode(selectedLanguage),
      output: '',
      environment: languageConfig.environment,
      isRunning: false,
      dependencies: []
    };

    setCells(prev => [...prev, newCell]);
  };

  const getDefaultCode = (language: SupportedLanguage): string => {
    switch (language) {
      case 'python':
        return '# Python cell\nprint("Hello from Python!")\n\n# You can use scientific libraries\nimport math\nprint(f"π = {math.pi}")';
      case 'javascript':
        return '// JavaScript cell\nconsole.log("Hello from JavaScript!");\n\n// Modern ES2023 features\nconst data = [1, 2, 3, 4, 5];\nconst doubled = data.map(x => x * 2);\nconsole.log("Doubled:", doubled);';
      case 'rust':
        return '// Rust cell (compiled to WASM)\nfn main() {\n    println!("Hello from Rust!");\n    \n    let numbers = vec![1, 2, 3, 4, 5];\n    let sum: i32 = numbers.iter().sum();\n    println!("Sum: {}", sum);\n}';
      case 'go':
        return '// Go cell\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n    \n    numbers := []int{1, 2, 3, 4, 5}\n    sum := 0\n    for _, n := range numbers {\n        sum += n\n    }\n    fmt.Printf("Sum: %d\\n", sum)\n}';
      case 'html':
        return '<!-- HTML cell with live preview -->\n<div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; border-radius: 10px;">\n    <h1>Hello from HTML!</h1>\n    <p>This renders live in the preview.</p>\n</div>';
      default:
        return `// ${language} cell\nconsole.log("Hello from ${language}!");`;
    }
  };

  const runCell = async (cellId: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, isRunning: true, output: '' } : cell
    ));

    try {
      // Simulate execution - in real implementation, this would call different execution engines
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const cell = cells.find(c => c.id === cellId);
      if (!cell) return;

      let output = '';
      switch (cell.environment) {
        case 'python-wasm':
          output = 'Hello from Python!\nπ = 3.141592653589793\n[Executed in Python WASM environment]';
          break;
        case 'browser':
          output = 'Hello from JavaScript!\nDoubled: [2, 4, 6, 8, 10]\n[Executed in browser environment]';
          break;
        case 'rust-wasm':
          output = 'Hello from Rust!\nSum: 15\n[Compiled to WASM and executed]';
          break;
        case 'container':
          output = 'Hello from Go!\nSum: 15\n[Executed in container environment]';
          break;
        default:
          output = 'Execution completed successfully.';
      }

      setCells(prev => prev.map(c => 
        c.id === cellId ? { ...c, isRunning: false, output } : c
      ));

      toast({
        title: "Cell Executed",
        description: `${cell.language} code executed successfully.`,
      });
    } catch (error) {
      setCells(prev => prev.map(c => 
        c.id === cellId ? { ...c, isRunning: false, output: 'Execution failed: ' + error } : c
      ));
    }
  };

  const deleteCell = (cellId: string) => {
    setCells(prev => prev.filter(cell => cell.id !== cellId));
  };

  const updateCellCode = (cellId: string, code: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, code } : cell
    ));
  };

  const downloadNotebook = () => {
    const notebook = {
      version: '1.0',
      cells: cells.map(cell => ({
        language: cell.language,
        environment: cell.environment,
        code: cell.code,
        output: cell.output
      }))
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prism-notebook.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-purple-500/30 bg-purple-500/5">
        <Beaker className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-300">
          <strong>Beta Notebook:</strong> Multi-language execution with WASM and container support.
          Advanced features are experimental.
        </AlertDescription>
      </Alert>

      {/* Notebook Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-purple-400" />
              <span>Multi-Language Notebook</span>
              <Badge variant="outline">Beta</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedLanguage} onValueChange={(value: SupportedLanguage) => setSelectedLanguage(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      <div className="flex items-center space-x-2">
                        {lang.icon}
                        <span>{lang.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {lang.environment}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addCell} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Cell
              </Button>
              {cells.length > 0 && (
                <Button onClick={downloadNotebook} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Cells */}
      <div className="space-y-4">
        {cells.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Code className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No cells yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first cell to start coding in multiple languages
              </p>
              <Button onClick={addCell}>
                <Plus className="w-4 h-4 mr-2" />
                Add {SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.name} Cell
              </Button>
            </CardContent>
          </Card>
        ) : (
          cells.map((cell, index) => {
            const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.id === cell.language);
            return (
              <Card key={cell.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={`bg-gradient-to-r ${languageConfig?.color} text-white`}>
                        {languageConfig?.icon}
                        <span className="ml-1">{languageConfig?.name}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Cell {index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {cell.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => runCell(cell.id)}
                        disabled={cell.isRunning}
                        size="sm"
                        variant="outline"
                      >
                        {cell.isRunning ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        Run
                      </Button>
                      <Button 
                        onClick={() => deleteCell(cell.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={cell.code}
                    onChange={(e) => updateCellCode(cell.id, e.target.value)}
                    className="font-mono text-sm min-h-[120px] resize-none"
                    placeholder={`Enter ${languageConfig?.name} code...`}
                  />
                  
                  {cell.output && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">Output:</span>
                      </div>
                      <div className="bg-black text-green-400 p-3 rounded font-mono text-sm whitespace-pre-wrap">
                        {cell.output}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BetaCodeNotebook;