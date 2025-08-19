
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, FolderOpen, Plus, Trash2, Download } from 'lucide-react';
import { FileContent } from '@/types/webApp';
import CodeEditor from './CodeEditor';

interface FileManagerProps {
  files: FileContent[];
  onFileChange: (filePath: string, content: string) => void;
  onFileAdd: (file: FileContent) => void;
  onFileDelete: (filePath: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileChange,
  onFileAdd,
  onFileDelete
}) => {
  const [activeFile, setActiveFile] = useState<string>(files[0]?.path || '');
  const [newFileName, setNewFileName] = useState('');

  const getFileIcon = (type: FileContent['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'html':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'css':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'javascript':
      case 'typescript':
        return <FileText className={`${iconClass} text-yellow-500`} />;
      case 'jsx':
      case 'tsx':
        return <FileText className={`${iconClass} text-cyan-500`} />;
      case 'json':
        return <FileText className={`${iconClass} text-green-500`} />;
      default:
        return <FileText className={`${iconClass} text-prism-text-muted`} />;
    }
  };

  const getLanguage = (type: FileContent['type']): string => {
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
        return 'text';
    }
  };

  const organizeFilesByFolder = (files: FileContent[]) => {
    const folders: Record<string, FileContent[]> = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : 'root';
      
      if (!folders[folderPath]) {
        folders[folderPath] = [];
      }
      folders[folderPath].push(file);
    });
    
    return folders;
  };

  const currentFile = files.find(f => f.path === activeFile);
  const organizedFiles = organizeFilesByFolder(files);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <span>File Manager</span>
          <Badge variant="secondary" className="ml-2">
            {files.length} files
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex h-full">
          {/* File Explorer */}
          <div className="w-64 border-r border-prism-border bg-prism-surface/5">
            <div className="p-4 border-b border-prism-border">
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  const newFile: FileContent = {
                    name: 'new-file.js',
                    content: '',
                    type: 'javascript',
                    path: 'new-file.js'
                  };
                  onFileAdd(newFile);
                  setActiveFile(newFile.path);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add File
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {Object.entries(organizedFiles).map(([folder, folderFiles]) => (
                  <div key={folder} className="mb-4">
                    {folder !== 'root' && (
                      <div className="flex items-center text-sm font-medium text-prism-text-muted mb-2 px-2">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        {folder}
                      </div>
                    )}
                    
                    {folderFiles.map((file) => (
                      <div
                        key={file.path}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-prism-surface/10 ${
                          activeFile === file.path ? 'bg-prism-surface/20 border border-prism-border' : ''
                        }`}
                        onClick={() => setActiveFile(file.path)}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-prism-text truncate">
                            {file.name}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileDelete(file.path);
                            if (activeFile === file.path) {
                              setActiveFile(files[0]?.path || '');
                            }
                          }}
                          disabled={files.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            {currentFile ? (
              <div className="h-full">
                <div className="flex items-center justify-between p-4 border-b border-prism-border bg-prism-surface/5">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(currentFile.type)}
                    <span className="font-medium text-prism-text">{currentFile.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {currentFile.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1">
                  <CodeEditor
                    language={getLanguage(currentFile.type)}
                    value={currentFile.content}
                    onChange={(content) => onFileChange(currentFile.path, content)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-prism-text-muted">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a file to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManager;
