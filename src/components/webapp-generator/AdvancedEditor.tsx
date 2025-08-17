import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Save, 
  Play, 
  Bug, 
  FileText, 
  Palette, 
  Settings,
  Maximize,
  Copy,
  Download,
  Search,
  Replace
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileTab {
  id: string;
  name: string;
  language: string;
  content: string;
  modified: boolean;
  path: string;
}

interface EditorError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface AdvancedEditorProps {
  files: FileTab[];
  activeFileId: string;
  onFileChange: (fileId: string, content: string) => void;
  onFileSelect: (fileId: string) => void;
  onSave: (fileId: string) => void;
  onRun?: () => void;
}

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  files,
  activeFileId,
  onFileChange,
  onFileSelect,
  onSave,
  onRun
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [errors, setErrors] = useState<EditorError[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(true);
  const { toast } = useToast();

  const activeFile = files.find(f => f.id === activeFileId);

  useEffect(() => {
    if (monacoRef.current) {
      setupMonacoEnvironment(monacoRef.current);
    }
  }, [monacoRef.current]);

  const setupMonacoEnvironment = (monaco: Monaco) => {
    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
      strict: true,
      skipLibCheck: true
    });

    // Add React type definitions
    const reactTypes = `
      declare module 'react' {
        export interface ComponentProps<T = {}> {
          children?: React.ReactNode;
        }
        export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
        export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        export function useMemo<T>(factory: () => T, deps: any[]): T;
        export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        export const Fragment: React.ComponentType<{ children?: React.ReactNode }>;
      }
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );

    // Setup error checking
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false
    });

    // Custom commands
    editorRef.current?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        handleSave();
      }
    });

    editorRef.current?.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      if (onRun) {
        onRun();
      }
    });
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Setup auto-completion
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        return {
          suggestions: [
            {
              label: 'console.log',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'console.log(${1:message});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Log a message to the console'
            },
            {
              label: 'useState',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'const [${1:state}, set${2:State}] = useState(${3:initialValue});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'React useState hook'
            }
          ]
        };
      }
    });

    // Error checking
    monaco.editor.onDidChangeMarkers(() => {
      if (activeFile) {
        const model = monaco.editor.getModel(monaco.Uri.parse(`file:///${activeFile.path}`));
        if (model) {
          const markers = monaco.editor.getModelMarkers({ resource: model.uri });
          const newErrors: EditorError[] = markers.map(marker => ({
            line: marker.startLineNumber,
            column: marker.startColumn,
            message: marker.message,
            severity: marker.severity === 8 ? 'error' : marker.severity === 4 ? 'warning' : 'info'
          }));
          setErrors(newErrors);
        }
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      onFileChange(activeFile.id, value);
    }
  };

  const handleSave = () => {
    if (activeFile) {
      onSave(activeFile.id);
      toast({
        title: "File Saved",
        description: `${activeFile.name} has been saved successfully.`,
      });
    }
  };

  const copyContent = () => {
    if (activeFile && navigator.clipboard) {
      navigator.clipboard.writeText(activeFile.content);
      toast({
        title: "Content Copied",
        description: "File content copied to clipboard.",
      });
    }
  };

  const downloadFile = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast({
        title: "Document Formatted",
        description: "Code has been formatted using Prettier.",
      });
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/30">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-prism-text">Code Editor - Fullscreen</h2>
              {activeFile && (
                <Badge variant="outline" className="text-xs">
                  {activeFile.language}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsFullscreen(false)} size="sm" variant="outline">
                Exit Fullscreen
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={activeFile?.language || 'typescript'}
              value={activeFile?.content || ''}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                fontSize,
                minimap: { enabled: showMinimap },
                wordWrap: 'on',
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Code className="w-5 h-5 text-prism-primary" />
            <span>Advanced Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={formatDocument}
              size="sm"
              variant="outline"
              title="Format Document (Ctrl+Shift+F)"
            >
              <Palette className="w-4 h-4" />
            </Button>
            <Button
              onClick={copyContent}
              size="sm"
              variant="outline"
              title="Copy Content"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={downloadFile}
              size="sm"
              variant="outline"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              variant="outline"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </Button>
            {onRun && (
              <Button
                onClick={onRun}
                size="sm"
                title="Run Code (Ctrl+R)"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={() => setIsFullscreen(true)}
              size="sm"
              variant="outline"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center space-x-1 mt-3">
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`px-3 py-1.5 text-sm rounded-t-lg border-b-2 transition-colors ${
                file.id === activeFileId
                  ? 'bg-prism-surface/30 border-prism-primary text-prism-text'
                  : 'bg-prism-surface/10 border-transparent text-prism-text-muted hover:bg-prism-surface/20'
              }`}
            >
              <span>{file.name}</span>
              {file.modified && <span className="ml-1 text-orange-400">•</span>}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative">
        {activeFile ? (
          <>
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                fontSize,
                minimap: { enabled: showMinimap },
                wordWrap: 'on',
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                },
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: true,
                trimAutoWhitespace: true,
                renderWhitespace: 'boundary',
                renderControlCharacters: true,
                fontLigatures: true,
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                mouseWheelZoom: true
              }}
            />
            
            {/* Error Panel */}
            {errors.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-prism-surface/90 border-t border-prism-border max-h-32 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-prism-text">
                      {errors.length} issue{errors.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="space-y-1">
                    {errors.slice(0, 5).map((error, index) => (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded ${
                          error.severity === 'error' 
                            ? 'bg-red-500/20 text-red-300' 
                            : error.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        Line {error.line}, Column {error.column}: {error.message}
                      </div>
                    ))}
                    {errors.length > 5 && (
                      <div className="text-xs text-prism-text-muted">
                        ... and {errors.length - 5} more issues
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-prism-text-muted">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a file to start editing</p>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-0 right-0 w-64 h-full bg-prism-surface/95 border-l border-prism-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-prism-text">Editor Settings</h3>
              <Button
                onClick={() => setShowSettings(false)}
                size="sm"
                variant="ghost"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-prism-text">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="hc-black">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-prism-text">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-prism-text">Show Minimap</label>
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => setShowMinimap(e.target.checked)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-prism-surface/30 border-t border-prism-border text-xs">
        <div className="flex items-center space-x-4">
          {activeFile && (
            <>
              <span className="text-prism-text-muted">
                {activeFile.language.toUpperCase()}
              </span>
              <span className="text-prism-text-muted">
                Line 1, Column 1
              </span>
              {errors.length > 0 && (
                <span className="text-red-400">
                  {errors.filter(e => e.severity === 'error').length} errors, {' '}
                  {errors.filter(e => e.severity === 'warning').length} warnings
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-prism-text-muted hover:text-prism-text"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedEditor;