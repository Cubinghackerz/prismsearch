
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, FileText, Code, Palette, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeneratedApp } from '@/services/codeGenerationService';

interface AdvancedCodeEditorProps {
  generatedApp: GeneratedApp;
  onFileChange?: (fileType: string, content: string) => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  generatedApp, 
  onFileChange 
}) => {
  const [activeTab, setActiveTab] = useState('html');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  const files = [
    { 
      key: 'html', 
      label: 'HTML', 
      content: generatedApp.html, 
      icon: FileText, 
      language: 'html',
      filename: 'index.html'
    },
    { 
      key: 'css', 
      label: 'CSS', 
      content: generatedApp.css, 
      icon: Palette, 
      language: 'css',
      filename: 'styles.css'
    },
    { 
      key: 'javascript', 
      label: 'JavaScript', 
      content: generatedApp.javascript, 
      icon: Code, 
      language: 'javascript',
      filename: 'script.js'
    },
  ];

  const activeFile = files.find(f => f.key === activeTab);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Monaco Editor options
    monaco.editor.defineTheme('prism-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });

    monaco.editor.setTheme('prism-dark');

    // Add custom snippets and auto-completion
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'html5',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 boilerplate'
          }
        ]
      })
    });

    // Add error detection
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && onFileChange) {
      onFileChange(activeTab, value);
    }
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard.`,
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast({
        title: "Code Formatted",
        description: "Your code has been automatically formatted.",
      });
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/10">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-prism-text">Code Editor - {activeFile?.filename}</h2>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-prism-surface/20">
                  {files.map((file) => {
                    const IconComponent = file.icon;
                    return (
                      <TabsTrigger key={file.key} value={file.key} className="flex items-center space-x-1">
                        <IconComponent className="w-4 h-4" />
                        <span>{file.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs-dark">Dark</SelectItem>
                  <SelectItem value="vs-light">Light</SelectItem>
                  <SelectItem value="hc-black">High Contrast</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={formatCode} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Format
              </Button>
              <Button onClick={() => setIsFullscreen(false)} variant="outline" size="sm">
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={activeFile?.language}
              value={activeFile?.content}
              theme={theme}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                glyphMargin: true,
                folding: true,
                showFoldingControls: 'always',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Code className="w-5 h-5 text-green-400" />
            <span>Advanced Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
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
            <Button onClick={() => setIsFullscreen(true)} variant="outline" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              {files.map((file) => {
                const IconComponent = file.icon;
                return (
                  <TabsTrigger key={file.key} value={file.key} className="flex items-center space-x-1">
                    <IconComponent className="w-4 h-4" />
                    <span>{file.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {files.map((file) => (
            <TabsContent key={file.key} value={file.key} className="flex-1 flex flex-col mt-4">
              <div className="flex items-center justify-between px-6 pb-2">
                <span className="text-sm font-medium text-prism-text">
                  {file.filename}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={formatCode}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Format
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(file.content, file.label)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(file.content, file.filename)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden">
                <Editor
                  height="400px"
                  language={file.language}
                  value={file.content}
                  theme={theme}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    glyphMargin: true,
                    folding: true,
                    showFoldingControls: 'mouseover',
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
