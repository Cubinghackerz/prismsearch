
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Code, Settings, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeneratedFile } from './types';

interface AdvancedCodeEditorProps {
  file: GeneratedFile;
  onFileChange?: (content: string) => void;
  onClose: () => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  file, 
  onFileChange,
  onClose
}) => {
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

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

    // Add framework-specific snippets
    if (file.language === 'typescript' || file.language === 'javascript') {
      monaco.languages.registerCompletionItemProvider(file.language, {
        provideCompletionItems: () => ({
          suggestions: [
            {
              label: 'react-component',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'import React from \'react\';\n\nconst ${1:ComponentName} = () => {\n\treturn (\n\t\t<div>\n\t\t\t${2}\n\t\t</div>\n\t);\n};\n\nexport default ${1:ComponentName};',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'React functional component'
            }
          ]
        })
      });
    }

    // Add error detection for TypeScript/JavaScript
    if (file.language === 'typescript' || file.language === 'javascript') {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && onFileChange) {
      onFileChange(value);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(file.content);
    toast({
      title: "Copied!",
      description: `${file.filename} code copied to clipboard.`,
    });
  };

  const downloadFile = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
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

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-prism-text">Code Editor - {file.filename}</h2>
            <div className="flex items-center space-x-2 text-sm text-prism-text-muted">
              <span className="capitalize">{file.type}</span>
              <span>•</span>
              <span className="capitalize">{file.language}</span>
            </div>
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
            <Button onClick={formatCode} variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Format
            </Button>
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={downloadFile} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              <Minimize2 className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            language={file.language}
            value={file.content}
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
};

export default AdvancedCodeEditor;
