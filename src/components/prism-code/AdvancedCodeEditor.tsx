
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Settings, Braces } from "lucide-react";
import CodeEditor from "./CodeEditor";
import { GeneratedApp } from "@/types/webApp";

interface AdvancedCodeEditorProps {
  generatedApp: GeneratedApp;
  onFileChange: (filePath: string, content: string) => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ 
  generatedApp, 
  onFileChange 
}) => {
  const [selectedFile, setSelectedFile] = useState(generatedApp.files?.[0]?.path || '');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'css':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'javascript':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'typescript':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'jsx':
        return <Braces className="w-4 h-4 text-cyan-500" />;
      case 'tsx':
        return <Braces className="w-4 h-4 text-purple-500" />;
      case 'json':
        return <Braces className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLanguage = (type: string, path: string) => {
    switch (type) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'jsx':
        return 'javascript';
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      default:
        if (path.endsWith('.md')) return 'markdown';
        if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
        return 'plaintext';
    }
  };

  const organizeFilesByDirectory = () => {
    if (!generatedApp.files || generatedApp.files.length === 0) {
      return {};
    }

    const organized: Record<string, typeof generatedApp.files> = {};
    
    generatedApp.files.forEach(file => {
      const directory = file.path.includes('/') ? 
        file.path.substring(0, file.path.lastIndexOf('/')) : 
        'root';
      
      if (!organized[directory]) {
        organized[directory] = [];
      }
      organized[directory].push(file);
    });
    
    return organized;
  };

  const organizedFiles = organizeFilesByDirectory();
  const selectedFileData = generatedApp.files?.find(f => f.path === selectedFile);

  // Auto-select first file if none selected
  React.useEffect(() => {
    if (!selectedFile && generatedApp.files && generatedApp.files.length > 0) {
      setSelectedFile(generatedApp.files[0].path);
    }
  }, [generatedApp.files, selectedFile]);

  if (!generatedApp.files || generatedApp.files.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-20">
          <FileText className="w-16 h-16 text-prism-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-prism-text mb-2">No Files Available</h3>
          <p className="text-prism-text-muted">Generate an application to see files here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-prism-primary" />
          <span>Advanced Code Editor</span>
          <Badge variant="outline" className="ml-auto">
            {generatedApp.files.length} files
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex h-full">
          {/* File Explorer */}
          <div className="w-64 border-r border-prism-border bg-prism-surface/5">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-prism-text mb-3">
                  Project Files
                </h3>
                
                {Object.entries(organizedFiles).map(([directory, files]) => (
                  <div key={directory} className="space-y-1">
                    {directory !== 'root' && (
                      <div className="text-xs font-medium text-prism-text-muted uppercase tracking-wider mb-2">
                        📁 {directory}
                      </div>
                    )}
                    
                    {files?.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file.path)}
                        className={`w-full flex items-center space-x-2 p-2 rounded-md text-left transition-colors text-sm ${
                          selectedFile === file.path
                            ? 'bg-prism-primary/20 text-prism-primary border border-prism-primary/30'
                            : 'text-prism-text-muted hover:text-prism-text hover:bg-prism-surface/20'
                        }`}
                      >
                        {getFileIcon(file.type)}
                        <span className="truncate font-mono">
                          {file.path.split('/').pop()}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="ml-auto text-xs"
                        >
                          {file.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            {selectedFileData ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/5">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(selectedFileData.type)}
                    <div>
                      <h3 className="font-semibold text-prism-text font-mono">
                        {selectedFileData.path}
                      </h3>
                      <p className="text-xs text-prism-text-muted">
                        {selectedFileData.type.toUpperCase()} • {selectedFileData.content.length} characters
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline">
                    {getLanguage(selectedFileData.type, selectedFileData.path)}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <CodeEditor
                    value={selectedFileData.content}
                    onChange={(content) => onFileChange(selectedFileData.path, content)}
                    language={getLanguage(selectedFileData.type, selectedFileData.path)}
                    height="100%"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-prism-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-prism-text mb-2">
                    Select a File
                  </h3>
                  <p className="text-prism-text-muted">
                    Choose a file from the explorer to start editing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
