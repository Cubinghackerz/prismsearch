
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Code, 
  Palette, 
  Settings, 
  File, 
  Folder,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import CodeEditor from './CodeEditor';

interface GeneratedApp {
  framework?: string;
  language?: string;
  description: string;
  features: string[];
  files?: Record<string, string>;
  // Legacy support
  html?: string;
  css?: string;
  javascript?: string;
}

interface AdvancedCodeEditorProps {
  generatedApp: GeneratedApp;
  onFileChange: (fileName: string, content: string) => void;
  selectedFile?: string;
  onFileSelect?: (fileName: string) => void;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({
  generatedApp,
  onFileChange,
  selectedFile = '',
  onFileSelect
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public']));

  // Get files - support both new and legacy formats
  const getFiles = () => {
    if (generatedApp.files) {
      return generatedApp.files;
    }
    // Legacy format fallback
    return {
      'index.html': generatedApp.html || '',
      'styles.css': generatedApp.css || '',
      'script.js': generatedApp.javascript || ''
    };
  };

  const files = getFiles();
  const fileNames = Object.keys(files);
  const currentFile = selectedFile || fileNames[0] || '';

  // Group files by directory for tree view
  const getFileTree = () => {
    const tree: Record<string, string[]> = { root: [] };
    
    fileNames.forEach(fileName => {
      const parts = fileName.split('/');
      if (parts.length === 1) {
        tree.root.push(fileName);
      } else {
        const folder = parts[0];
        if (!tree[folder]) {
          tree[folder] = [];
        }
        tree[folder].push(fileName);
      }
    });
    
    return tree;
  };

  const fileTree = getFileTree();

  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
      case 'scss':
      case 'sass':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'vue':
        return 'vue';
      default:
        return 'javascript';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return <File className="w-4 h-4 text-orange-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <Palette className="w-4 h-4 text-blue-500" />;
      case 'js':
      case 'jsx':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-blue-600" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-prism-text-muted" />;
    }
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = (fileName: string) => {
    if (onFileSelect) {
      onFileSelect(fileName);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-prism-primary" />
            <span>Code Editor</span>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              {generatedApp.framework || 'Vanilla'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {fileNames.length} files
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex gap-4 p-4">
        {/* File Tree */}
        <div className="w-64 border-r border-prism-border pr-4">
          <h3 className="text-sm font-semibold text-prism-text mb-3">Project Files</h3>
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {/* Root files */}
              {fileTree.root.map(fileName => (
                <div
                  key={fileName}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-prism-surface/20 ${
                    currentFile === fileName ? 'bg-prism-surface/30' : ''
                  }`}
                  onClick={() => handleFileSelect(fileName)}
                >
                  {getFileIcon(fileName)}
                  <span className="text-sm text-prism-text">{fileName}</span>
                </div>
              ))}
              
              {/* Folders */}
              {Object.entries(fileTree)
                .filter(([folderName]) => folderName !== 'root')
                .map(([folderName, folderFiles]) => (
                  <div key={folderName}>
                    <div
                      className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-prism-surface/10"
                      onClick={() => toggleFolder(folderName)}
                    >
                      {expandedFolders.has(folderName) ? (
                        <ChevronDown className="w-4 h-4 text-prism-text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-prism-text-muted" />
                      )}
                      <Folder className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-prism-text">{folderName}</span>
                    </div>
                    
                    {expandedFolders.has(folderName) && (
                      <div className="ml-6 space-y-1">
                        {folderFiles.map(fileName => (
                          <div
                            key={fileName}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-prism-surface/20 ${
                              currentFile === fileName ? 'bg-prism-surface/30' : ''
                            }`}
                            onClick={() => handleFileSelect(fileName)}
                          >
                            {getFileIcon(fileName)}
                            <span className="text-sm text-prism-text">
                              {fileName.split('/').pop()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getFileIcon(currentFile)}
                  <span className="font-medium text-prism-text">{currentFile}</span>
                  <Badge variant="outline" className="text-xs">
                    {getLanguage(currentFile)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 border border-prism-border rounded-lg overflow-hidden">
                <CodeEditor
                  language={getLanguage(currentFile)}
                  code={files[currentFile] || ''}
                  onChange={(content) => onFileChange(currentFile, content)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                <p className="text-prism-text-muted">Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCodeEditor;
