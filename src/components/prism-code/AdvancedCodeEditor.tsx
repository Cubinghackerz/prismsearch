
import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, AlertCircle, CheckCircle, Play, Settings } from 'lucide-react';

interface FileData {
  name: string;
  content: string;
  language: string;
  errors?: Array<{
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

interface AdvancedCodeEditorProps {
  files: FileData[];
  onFileChange: (fileName: string, content: string) => void;
  onSave?: () => void;
  onRun?: () => void;
  className?: string;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({
  files,
  onFileChange,
  onSave,
  onRun,
  className = ''
}) => {
  const [activeFile, setActiveFile] = useState(files[0]?.name || '');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<any>(null);

  const currentFile = files.find(f => f.name === activeFile);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });

    // Add React types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
      declare module 'react' {
        export interface Component<P = {}, S = {}> {}
        export function useState<T>(initialState: T): [T, (value: T) => void];
        export function useEffect(effect: () => void, deps?: any[]): void;
        export const Fragment: any;
      }
    `, 'ts:react.d.ts');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentFile) {
      onFileChange(currentFile.name, value);
    }
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  const getTotalErrors = () => {
    return files.reduce((total, file) => total + (file.errors?.length || 0), 0);
  };

  const getTotalWarnings = () => {
    return files.reduce((total, file) => 
      total + (file.errors?.filter(e => e.severity === 'warning').length || 0), 0);
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-prism-primary" />
            <span>Advanced Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getTotalErrors() > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {getTotalErrors()} errors
                </Badge>
              )}
              {getTotalWarnings() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {getTotalWarnings()} warnings
                </Badge>
              )}
              {getTotalErrors() === 0 && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  No errors
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              {onRun && (
                <Button onClick={onRun} size="sm" variant="outline">
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
              )}
              {onSave && (
                <Button onClick={onSave} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Tabs value={activeFile} onValueChange={setActiveFile} className="flex-1">
            <TabsList className="w-fit">
              {files.map((file) => (
                <TabsTrigger key={file.name} value={file.name} className="text-xs">
                  {file.name}
                  {file.errors && file.errors.length > 0 && (
                    <AlertCircle className="w-3 h-3 ml-1 text-red-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Select value={editorTheme} onValueChange={(value: 'vs-dark' | 'light') => setEditorTheme(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {currentFile && (
          <Editor
            height="100%"
            language={getLanguageFromFileName(currentFile.name)}
            value={currentFile.content}
            theme={editorTheme}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize,
              minimap: { enabled: true },
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              selectOnLineNumbers: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              readOnly: false,
              cursorStyle: 'line',
              mouseWheelZoom: true,
              formatOnPaste: true,
              formatOnType: true,
              autoIndent: 'full',
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: false,
              renderWhitespace: 'boundary',
              showFoldingControls: 'always',
              glyphMargin: true,
              lightbulb: {
                enabled: true
              }
            }}
          />
        )}

        {currentFile?.errors && currentFile.errors.length > 0 && (
          <div className="border-t bg-prism-surface/10 p-2">
            <div className="text-sm font-medium mb-2">Problems</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {currentFile.errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <AlertCircle className={`w-3 h-3 ${
                    error.severity === 'error' ? 'text-red-500' : 
                    error.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <span className="text-prism-text-muted">Line {error.line}:</span>
                  <span className="text-prism-text">{error.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
