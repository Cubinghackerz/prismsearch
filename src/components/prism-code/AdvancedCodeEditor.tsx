
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Copy, Check, Code, FileCode, Palette } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useToast } from '@/hooks/use-toast';
import { CodingLanguage } from './LanguageSelector';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
  language?: CodingLanguage;
}

interface AdvancedCodeEditorProps {
  generatedApp: GeneratedApp;
  onFileChange: (fileType: string, content: string) => void;
  selectedLanguage?: CodingLanguage;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  generatedApp, 
  onFileChange,
  selectedLanguage = 'javascript'
}) => {
  const [activeTab, setActiveTab] = useState('html');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const getLanguageExtension = (language: CodingLanguage) => {
    switch (language) {
      case 'python':
        return 'py';
      case 'typescript':
        return 'ts';
      case 'javascript':
      default:
        return 'js';
    }
  };

  const getMonacoLanguage = (fileType: string) => {
    switch (fileType) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
        if (selectedLanguage === 'python') return 'python';
        if (selectedLanguage === 'typescript') return 'typescript';
        return 'javascript';
      default:
        return 'javascript';
    }
  };

  const getFileDisplayName = (fileType: string) => {
    switch (fileType) {
      case 'html':
        return 'index.html';
      case 'css':
        return 'styles.css';
      case 'javascript':
        if (selectedLanguage === 'python') return 'app.py';
        if (selectedLanguage === 'typescript') return 'script.ts';
        return 'script.js';
      default:
        return fileType;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'html':
        return <FileText className="w-4 h-4" />;
      case 'css':
        return <Palette className="w-4 h-4" />;
      case 'javascript':
        return <Code className="w-4 h-4" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const copyToClipboard = async (content: string, fileType: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [fileType]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [fileType]: false }));
      }, 2000);
      toast({
        title: "Copied!",
        description: `${getFileDisplayName(fileType)} content copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadFile = (content: string, fileType: string) => {
    const fileName = getFileDisplayName(fileType);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File Downloaded",
      description: `${fileName} has been downloaded.`,
    });
  };

  const files = [
    { type: 'html', content: generatedApp.html, language: 'html' },
    { type: 'css', content: generatedApp.css, language: 'css' },
    { type: 'javascript', content: generatedApp.javascript, language: getMonacoLanguage('javascript') }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-prism-primary" />
            <span>Code Editor</span>
            <Badge variant="outline" className="ml-2">
              {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              {files.map((file) => (
                <TabsTrigger key={file.type} value={file.type} className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span>{getFileDisplayName(file.type)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {files.map((file) => (
            <TabsContent key={file.type} value={file.type} className="flex-1 flex flex-col mt-4">
              <div className="flex items-center justify-between px-6 pb-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium text-prism-text">
                    {getFileDisplayName(file.type)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {file.language}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(file.content, file.type)}
                    className="h-8 px-2"
                  >
                    {copiedStates[file.type] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadFile(file.content, file.type)}
                    className="h-8 px-2"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 px-6 pb-6">
                <div className="border border-prism-border rounded-lg overflow-hidden h-full">
                  <Editor
                    height="100%"
                    language={file.language}
                    value={file.content}
                    onChange={(value) => onFileChange(file.type, value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      folding: true,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectionHighlight: false,
                      bracketPairColorization: { enabled: true }
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
