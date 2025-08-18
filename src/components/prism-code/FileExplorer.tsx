
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Package, Settings, TestTube, Palette, Code, FolderOpen } from 'lucide-react';
import { GeneratedFile } from './types';

interface FileExplorerProps {
  files: GeneratedFile[];
  onFileSelect: (file: GeneratedFile) => void;
  selectedFile?: GeneratedFile;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedFile }) => {
  const getFileIcon = (file: GeneratedFile) => {
    switch (file.type) {
      case 'component':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'style':
        return <Palette className="w-4 h-4 text-purple-400" />;
      case 'config':
        return <Settings className="w-4 h-4 text-gray-400" />;
      case 'test':
        return <TestTube className="w-4 h-4 text-green-400" />;
      case 'asset':
        return <Package className="w-4 h-4 text-orange-400" />;
      default:
        return <FileText className="w-4 h-4 text-prism-text-muted" />;
    }
  };

  const getFileExtensionColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'text-blue-400';
      case 'jsx':
      case 'js':
        return 'text-yellow-400';
      case 'vue':
        return 'text-green-400';
      case 'svelte':
        return 'text-orange-400';
      case 'css':
      case 'scss':
      case 'sass':
        return 'text-purple-400';
      case 'html':
        return 'text-red-400';
      case 'json':
        return 'text-gray-400';
      default:
        return 'text-prism-text-muted';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <span>Project Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4">
            {files.map((file, index) => (
              <Button
                key={index}
                variant={selectedFile?.filename === file.filename ? "secondary" : "ghost"}
                className="w-full justify-start p-3 h-auto"
                onClick={() => onFileSelect(file)}
              >
                <div className="flex items-center space-x-3 w-full">
                  {getFileIcon(file)}
                  <div className="flex-1 text-left">
                    <div className={`font-mono text-sm ${getFileExtensionColor(file.filename)}`}>
                      {file.filename}
                    </div>
                    <div className="text-xs text-prism-text-muted capitalize">
                      {file.type} • {file.language}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FileExplorer;
