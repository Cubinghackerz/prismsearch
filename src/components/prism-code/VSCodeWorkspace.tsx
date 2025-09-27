import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Code2, Folders, Sparkles } from 'lucide-react';

export interface WorkspaceFile {
  path: string;
  language: string;
  content: string;
}

interface VSCodeWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: WorkspaceFile[];
  modelName?: string;
  onFileChange?: (path: string, content: string) => void;
}

const VSCodeWorkspace = ({
  open,
  onOpenChange,
  files,
  modelName = 'Gemini 2.5 Pro',
  onFileChange,
}: VSCodeWorkspaceProps) => {
  const [activeFile, setActiveFile] = useState(files[0]?.path ?? '');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  useEffect(() => {
    const initialMap: Record<string, string> = {};
    files.forEach((file) => {
      initialMap[file.path] = file.content;
    });
    setFileContents(initialMap);
    if (files.length > 0) {
      setActiveFile(files[0].path);
    }
  }, [files]);

  const currentFile = useMemo(() => files.find((file) => file.path === activeFile), [files, activeFile]);
  const currentContent = currentFile ? fileContents[currentFile.path] ?? currentFile.content : '';

  const handleEditorChange = (value?: string) => {
    if (!currentFile || typeof value !== 'string') return;

    setFileContents((prev) => ({
      ...prev,
      [currentFile.path]: value,
    }));

    if (onFileChange) {
      onFileChange(currentFile.path, value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/40 backdrop-blur">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Code2 className="h-5 w-5 text-primary" />
            AI Workspace
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            {modelName} can collaborate with you inside this VS Code inspired workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-56 border-r border-border/40 bg-muted/20">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-border/40">
              <Folders className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Explorer</span>
            </div>
            <ScrollArea className="h-[calc(80vh-9rem)]">
              <nav className="p-2 space-y-1">
                {files.map((file) => {
                  const isActive = file.path === activeFile;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setActiveFile(file.path)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      )}
                    >
                      <span className="truncate">{file.path}</span>
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </aside>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/10">
              <Tabs value={activeFile} onValueChange={setActiveFile} className="w-full">
                <TabsList className="flex w-full h-10 bg-muted/20">
                  {files.map((file) => (
                    <TabsTrigger
                      key={file.path}
                      value={file.path}
                      className={cn(
                        'h-full px-4 text-sm font-medium border-r border-border/40 rounded-none',
                        file.path === activeFile
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {file.path.split('/').pop()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => setEditorTheme((prev) => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'))}>
                  Switch to {editorTheme === 'vs-dark' ? 'Light' : 'Dark'} Theme
                </Button>
                <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="flex-1">
              {currentFile ? (
                <Editor
                  language={currentFile.language}
                  value={currentContent}
                  theme={editorTheme}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: true },
                    automaticLayout: true,
                  }}
                  height="100%"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a file to begin editing.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/30">
          <div className="text-xs text-muted-foreground">
            All edits made here stay in sync with the current project so Gemini can reference the latest changes during follow-up prompts.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VSCodeWorkspace;
