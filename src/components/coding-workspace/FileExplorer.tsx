import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Folder, Plus, Trash2, Edit, Code, 
  Image, Database, Settings, Globe
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';

const FileExplorer: React.FC = () => {
  const { workspace, createFile, deleteFile } = useWorkspace();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': case 'ts': case 'tsx': return <Code className="w-4 h-4 text-yellow-500" />;
      case 'html': return <Globe className="w-4 h-4 text-orange-500" />;
      case 'css': case 'scss': case 'sass': return <Image className="w-4 h-4 text-blue-500" />;
      case 'json': return <Database className="w-4 h-4 text-green-500" />;
      case 'py': return <Code className="w-4 h-4 text-blue-600" />;
      case 'java': return <Code className="w-4 h-4 text-red-600" />;
      case 'php': return <Code className="w-4 h-4 text-purple-600" />;
      case 'rb': return <Code className="w-4 h-4 text-red-500" />;
      case 'vue': return <Code className="w-4 h-4 text-green-600" />;
      case 'svelte': return <Code className="w-4 h-4 text-orange-600" />;
      case 'md': return <FileText className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const defaultContent = getDefaultContent(newFileName);
      createFile(newFileName.trim(), defaultContent);
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const getDefaultContent = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
        return '// JavaScript file\nconsole.log("Hello, World!");';
      case 'ts':
        return '// TypeScript file\nconst message: string = "Hello, World!";\nconsole.log(message);';
      case 'jsx':
        return 'import React from "react";\n\nexport default function Component() {\n  return <div>Hello, World!</div>;\n}';
      case 'tsx':
        return 'import React from "react";\n\ninterface Props {}\n\nexport default function Component({}: Props) {\n  return <div>Hello, World!</div>;\n}';
      case 'html':
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>';
      case 'css':
        return '/* CSS file */\nbody {\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n    margin: 0;\n    padding: 20px;\n}';
      case 'py':
        return '# Python file\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()';
      case 'java':
        return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';
      case 'json':
        return '{\n  "name": "example",\n  "version": "1.0.0"\n}';
      default:
        return '// New file\n';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setIsCreatingFile(false);
      setNewFileName('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        {isCreatingFile ? (
          <div className="space-y-2">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="filename.ext"
              autoFocus
              className="text-sm"
            />
            <div className="flex space-x-1">
              <Button onClick={handleCreateFile} size="sm" disabled={!newFileName.trim()}>
                Create
              </Button>
              <Button 
                onClick={() => {
                  setIsCreatingFile(false);
                  setNewFileName('');
                }}
                size="sm" 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsCreatingFile(true)}
            size="sm" 
            variant="outline" 
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            New File
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {Object.values(workspace.files).map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-2 rounded hover:bg-muted/50 group"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getFileIcon(file.path)}
                <span className="text-sm truncate" title={file.path}>
                  {file.path}
                </span>
                {file.modified && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                )}
              </div>
              <Button
                onClick={() => deleteFile(file.path)}
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {Object.keys(workspace.files).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files yet</p>
              <p className="text-xs">Files will appear here as the AI creates them</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;