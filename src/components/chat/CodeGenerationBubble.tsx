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
import { Code2, ExternalLink, LayoutTemplate, Monitor, Sparkles } from 'lucide-react';

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
  const [appState, setAppState] = useState<GeneratedApp>(result);
  const navigate = useNavigate();

  useEffect(() => {
    setAppState(result);
  }, [result]);

  const featureList = useMemo(() => {
    return (appState.features || []).slice(0, 6);
  }, [appState.features]);

  const handleFileChange = (fileType: string, content: string) => {
    setAppState((prev) => ({
      ...prev,
      [fileType]: content,
    }));
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
              />
            </div>
          )}
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

      <VSCodeWorkspace
        open={isVSCodeOpen}
        onOpenChange={setIsVSCodeOpen}
        files={[
          { path: 'index.html', language: 'html', content: appState.html },
          { path: 'styles.css', language: 'css', content: appState.css },
          { path: 'script.js', language: 'javascript', content: appState.javascript },
        ]}
        onFileChange={(path, content) => {
          if (path.endsWith('.html')) {
            handleFileChange('html', content);
          } else if (path.endsWith('.css')) {
            handleFileChange('css', content);
          } else if (path.endsWith('.js')) {
            handleFileChange('javascript', content);
          }
        }}
      />
    </div>
  );
};

export default CodeGenerationBubble;
