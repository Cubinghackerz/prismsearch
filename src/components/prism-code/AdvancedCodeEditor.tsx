
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface GeneratedFile {
  name: string;
  content: string;
  type: 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'python' | 'json' | 'md';
}

interface GeneratedApp {
  files?: GeneratedFile[];
  // Legacy support
  html?: string;
  css?: string;
  javascript?: string;
  description: string;
  features: string[];
}

interface AdvancedCodeEditorProps {
  generatedApp: GeneratedApp;
  onFileChange: (fileName: string, content: string) => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  generatedApp, 
  onFileChange 
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const { toast } = useToast();

  // Get files from new structure or create from legacy structure
  const files = generatedApp.files || [
    { name: 'index.html', content: generatedApp.html || '', type: 'html' as const },
    { name: 'style.css', content: generatedApp.css || '', type: 'css' as const },
    { name: 'script.js', content: generatedApp.javascript || '', type: 'javascript' as const }
  ].filter(file => file.content.trim()); // Only include files with content

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'javascript':
      case 'typescript': return '⚡';
      case 'jsx':
      case 'tsx': return '⚛️';
      case 'python': return '🐍';
      case 'json': return '📋';
      case 'md': return '📄';
      default: return '📄';
    }
  };

  const getLanguageFromType = (type: string): string => {
    switch (type) {
      case 'javascript': return 'javascript';
      case 'typescript': return 'typescript';
      case 'jsx': return 'javascript';
      case 'tsx': return 'typescript';
      case 'python': return 'python';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': return 'css';
      case 'html': return 'html';
      default: return 'text';
    }
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${fileName} content copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
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
    
    toast({
      title: "File downloaded",
      description: `${fileName} has been downloaded`,
    });
  };

  if (files.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-prism-surface/5">
        <CardContent className="text-center py-20">
          <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
          <p className="text-prism-text-muted">No files to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-prism-surface/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-prism-primary" />
            <span>Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {files.length} files
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue={files[0]?.name} className="flex-1 flex flex-col">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(files.length, 4)}, 1fr)` }}>
              {files.slice(0, 4).map((file) => (
                <TabsTrigger 
                  key={file.name} 
                  value={file.name}
                  className="flex items-center space-x-1 text-xs"
                >
                  <span>{getFileIcon(file.type)}</span>
                  <span className="truncate max-w-20">{file.name}</span>
                </TabsTrigger>
              ))}
              {files.length > 4 && (
                <div className="flex items-center justify-center text-xs text-prism-text-muted">
                  +{files.length - 4} more
                </div>
              )}
            </TabsList>
          </div>

          <div className="flex-1 px-4 pb-4">
            {files.map((file) => (
              <TabsContent 
                key={file.name} 
                value={file.name} 
                className="h-full flex flex-col mt-0"
              >
                <div className="flex items-center justify-between mb-3 p-2 bg-prism-surface/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div>
                      <h4 className="font-medium text-prism-text text-sm">{file.name}</h4>
                      <p className="text-xs text-prism-text-muted capitalize">
                        {getLanguageFromType(file.type)} • {file.content.length} chars
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(file.content, file.name)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedFile === file.name ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(file.content, file.name)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <Textarea
                    value={file.content}
                    onChange={(e) => onFileChange(file.name, e.target.value)}
                    className="min-h-[400px] font-mono text-sm bg-prism-surface/10 border-prism-border resize-none"
                    placeholder={`Enter your ${getLanguageFromType(file.type)} code here...`}
                  />
                </div>
              </TabsContent>
            ))}
          </div>

          {/* Show additional files if more than 4 */}
          {files.length > 4 && (
            <div className="px-4 pb-4">
              <div className="bg-prism-surface/10 rounded-lg p-3">
                <h4 className="font-medium text-prism-text text-sm mb-2">Additional Files:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {files.slice(4).map((file) => (
                    <div key={file.name} className="flex items-center space-x-2 text-xs">
                      <span>{getFileIcon(file.type)}</span>
                      <span className="truncate">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(file.content, file.name)}
                        className="h-6 w-6 p-0 ml-auto"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
