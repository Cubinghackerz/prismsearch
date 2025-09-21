import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeneratedApp } from '@/services/codeGenerationService';
import AdvancedCodeEditor from '@/components/prism-code/AdvancedCodeEditor';
import WebAppPreview from '@/components/prism-code/WebAppPreview';
import VSCodeWorkspace from '@/components/prism-code/VSCodeWorkspace';
import { useNavigate } from 'react-router-dom';
import { Code2, ExternalLink, FileCode2, LayoutTemplate, Maximize2, Monitor, Sparkles } from 'lucide-react';

interface CodeGenerationBubbleProps {
  result: GeneratedApp;
  prompt: string;
  usedModel?: string;
  rawResponse?: string;
}

const CodeGenerationBubble = ({ result, prompt, usedModel, rawResponse }: CodeGenerationBubbleProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVSCodeOpen, setIsVSCodeOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [appState, setAppState] = useState<GeneratedApp>(result);
  const navigate = useNavigate();

  useEffect(() => {
    setAppState(result);
  }, [result]);

  const featureList = useMemo(() => {
    return (appState.features || []).slice(0, 6);
  }, [appState.features]);

  const workspaceFiles = useMemo(() => {
    const map = new Map<string, { path: string; language: string; content: string }>();

    map.set('index.html', { path: 'index.html', language: 'html', content: appState.html });
    map.set('styles.css', { path: 'styles.css', language: 'css', content: appState.css });
    map.set('script.js', { path: 'script.js', language: 'javascript', content: appState.javascript });

    if (appState.previewHtml) {
      map.set('preview.html', { path: 'preview.html', language: 'html', content: appState.previewHtml });
    }

    (appState.files || []).forEach((file) => {
      if (file.path) {
        map.set(file.path, {
          path: file.path,
          language: file.language || 'plaintext',
          content: file.content,
        });
      }
    });

    return Array.from(map.values());
  }, [appState]);

  const handleFileChange = (fileType: string, content: string) => {
    setAppState((prev) => {
      if (!prev) {
        return prev;
      }

      if (fileType === 'html' || fileType === 'css' || fileType === 'javascript') {
        return {
          ...prev,
          [fileType]: content,
        };
      }

      if (fileType === 'previewHtml') {
        return {
          ...prev,
          previewHtml: content,
        };
      }

      if (fileType.startsWith('file:')) {
        const path = fileType.replace(/^file:/, '');
        const existingFiles = prev.files || [];
        const existingIndex = existingFiles.findIndex((file) => file.path === path);
        const sourceFile = existingFiles[existingIndex] || result.files?.find((file) => file.path === path);
        const updatedFile = {
          path,
          language: sourceFile?.language || 'plaintext',
          description: sourceFile?.description,
          content,
        };

        const updatedFiles = existingIndex >= 0
          ? existingFiles.map((file, index) => (index === existingIndex ? updatedFile : file))
          : [...existingFiles, updatedFile];

        return {
          ...prev,
          files: updatedFiles,
        };
      }

      return prev;
    });
  };

  const handleOpenInPrismCode = () => {
    navigate('/prism-code', {
      state: {
        prompt,
        generatedApp: appState,
        model: usedModel,
        rawResponse,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI-generated web application</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {usedModel ? `Generated with ${usedModel}` : 'Generated with your selected model'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">/code</Badge>
      </div>

      <Card className="bg-muted/20 border-border/40">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Prompt</p>
            <p className="text-sm text-foreground leading-relaxed mt-1">{prompt}</p>
          </div>

          {featureList.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Key features</p>
              <div className="flex flex-wrap gap-2">
                {featureList.map((feature, index) => (
                  <Badge key={`${feature}-${index}`} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowPreview((prev) => !prev)}>
              <Monitor className="h-4 w-4" />
              {showPreview ? 'Hide preview' : 'Preview app'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsPreviewFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen preview
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditorOpen(true)}>
              <Code2 className="h-4 w-4" />
              View code
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsVSCodeOpen(true)}>
              <LayoutTemplate className="h-4 w-4" />
              Open VS Code
            </Button>
            <Button size="sm" className="flex items-center gap-2" onClick={handleOpenInPrismCode}>
              <ExternalLink className="h-4 w-4" />
              Open in Prism Code
            </Button>
          </div>

          {showPreview && (
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <WebAppPreview
                html={appState.html}
                css={appState.css}
                javascript={appState.javascript}
                previewHtml={appState.previewHtml}
              />
            </div>
          )}

          {appState.stack && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stack details</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  Language: {appState.stack.language}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Framework: {appState.stack.framework}
                </Badge>
              </div>
              {appState.stack.libraries?.length ? (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Libraries:</span>{' '}
                  {appState.stack.libraries.join(', ')}
                </div>
              ) : null}
              {appState.stack.tooling?.length ? (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Tooling:</span>{' '}
                  {appState.stack.tooling.join(', ')}
                </div>
              ) : null}
              {appState.stack.notes && (
                <div className="text-xs text-muted-foreground">{appState.stack.notes}</div>
              )}
            </div>
          )}

          {appState.files?.length ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Generated files</p>
              <div className="space-y-2">
                {appState.files.map((file) => (
                  <div key={file.path} className="flex items-start gap-2 rounded-md border border-border/40 p-2 bg-muted/10">
                    <FileCode2 className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{file.path}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {file.language}
                        </Badge>
                      </div>
                      {file.description && (
                        <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>Generated source code</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <AdvancedCodeEditor generatedApp={appState} onFileChange={handleFileChange} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewFullscreen} onOpenChange={setIsPreviewFullscreen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/40 backdrop-blur">
            <DialogTitle>Live preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-background">
            <WebAppPreview
              html={appState.html}
              css={appState.css}
              javascript={appState.javascript}
              previewHtml={appState.previewHtml}
              standalone
            />
          </div>
        </DialogContent>
      </Dialog>

      <VSCodeWorkspace
        open={isVSCodeOpen}
        onOpenChange={setIsVSCodeOpen}
        files={workspaceFiles}
        onFileChange={(path, content) => {
          if (path === 'index.html') {
            handleFileChange('html', content);
          } else if (path === 'styles.css') {
            handleFileChange('css', content);
          } else if (path === 'script.js') {
            handleFileChange('javascript', content);
          } else if (path === 'preview.html') {
            handleFileChange('previewHtml', content);
          } else {
            handleFileChange(`file:${path}`, content);
          }
        }}
      />
    </div>
  );
};

export default CodeGenerationBubble;
