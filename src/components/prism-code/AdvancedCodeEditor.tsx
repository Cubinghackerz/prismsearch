
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText, Code, Palette, Package, Save, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileData {
  name: string;
  content: string;
  language: string;
  icon: React.ComponentType<any>;
}

interface AdvancedCodeEditorProps {
  files: FileData[];
  onFileChange: (fileName: string, content: string) => void;
  onSave?: () => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  files, 
  onFileChange, 
  onSave 
}) => {
  const [activeFile, setActiveFile] = useState(files[0]?.name || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const handleEditorChange = (value: string | undefined, fileName: string) => {
    if (value !== undefined) {
      onFileChange(fileName, value);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    onSave?.();
    setHasUnsavedChanges(false);
    toast({
      title: "Files Saved",
      description: "All changes have been saved successfully.",
    });
  };

  const copyToClipboard = (content: string, fileName: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: `${fileName} content copied to clipboard.`,
    });
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentFile = files.find(f => f.name === activeFile);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Code className="w-5 h-5 text-green-400" />
            <span>Advanced Code Editor</span>
            {hasUnsavedChanges && (
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                Unsaved
              </span>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeFile} onValueChange={setActiveFile} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className={`grid w-full ${files.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {files.map((file) => {
                const IconComponent = file.icon;
                return (
                  <TabsTrigger key={file.name} value={file.name} className="flex items-center space-x-1">
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{file.name.split('.')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {files.map((file) => (
            <TabsContent key={file.name} value={file.name} className="flex-1 flex flex-col mt-4">
              <div className="flex items-center justify-between px-6 pb-2">
                <span className="text-sm font-medium text-prism-text">
                  {file.name}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(file.content, file.name)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(file.content, file.name)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  language={file.language}
                  value={file.content}
                  onChange={(value) => handleEditorChange(value, file.name)}
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
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    bracketPairColorization: { enabled: true },
                    suggest: {
                      enabled: true,
                      showKeywords: true,
                      showSnippets: true,
                    },
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
