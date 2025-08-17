
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText, Code, Palette, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
  packageJson?: string;
}

interface FileViewerProps {
  generatedApp: GeneratedApp;
}

const FileViewer: React.FC<FileViewerProps> = ({ generatedApp }) => {
  const [activeTab, setActiveTab] = useState('html');
  const { toast } = useToast();

  const files = [
    { key: 'html', label: 'HTML', content: generatedApp.html, icon: FileText, language: 'html' },
    { key: 'css', label: 'CSS', content: generatedApp.css, icon: Palette, language: 'css' },
    { key: 'javascript', label: 'JavaScript', content: generatedApp.javascript, icon: Code, language: 'javascript' },
  ];

  // Add package.json if it exists
  if (generatedApp.packageJson) {
    files.push({
      key: 'package',
      label: 'package.json',
      content: generatedApp.packageJson,
      icon: Package,
      language: 'json'
    });
  }

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

  const getFileName = (file: typeof files[0]) => {
    if (file.key === 'package') return 'package.json';
    if (file.key === 'javascript') return 'script.js';
    return `${file.key === 'html' ? 'index' : 'styles'}.${file.key}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Code className="w-5 h-5 text-green-400" />
          <span>Generated Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className={`grid w-full ${files.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {files.map((file) => {
                const IconComponent = file.icon;
                return (
                  <TabsTrigger key={file.key} value={file.key} className="flex items-center space-x-1">
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{file.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {files.map((file) => (
            <TabsContent key={file.key} value={file.key} className="flex-1 flex flex-col mt-4">
              <div className="flex items-center justify-between px-6 pb-2">
                <span className="text-sm font-medium text-prism-text">
                  {getFileName(file)}
                </span>
                <div className="flex space-x-2">
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
                    onClick={() => downloadFile(file.content, getFileName(file))}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden">
                <pre className="h-full overflow-auto p-4 bg-prism-surface/10 text-sm">
                  <code className="text-prism-text whitespace-pre-wrap">
                    {file.content}
                  </code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileViewer;
