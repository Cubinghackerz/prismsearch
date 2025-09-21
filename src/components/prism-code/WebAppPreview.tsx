import React, { useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { CodeGenerationStack, GeneratedPreviewMode } from '@/services/codeGenerationService';

interface WebAppPreviewProps {
  html: string;
  css: string;
  javascript: string;
  previewHtml?: string;
  previewMode?: GeneratedPreviewMode;
  previewNotes?: string[];
  stack?: CodeGenerationStack;
  standalone?: boolean;
  className?: string;
  showAlert?: boolean;
}

const WebAppPreview = ({
  html,
  css,
  javascript,
  previewHtml,
  previewMode,
  previewNotes,
  stack,
  standalone = false,
  className,
  showAlert = true,
}: WebAppPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resolvedPreviewMode: GeneratedPreviewMode = useMemo(() => {
    if (previewMode === 'dynamic' || previewMode === 'mocked' || previewMode === 'instructions' || previewMode === 'static') {
      return previewMode;
    }

    return 'static';
  }, [previewMode]);

  const resolvedNotes = useMemo(() => {
    if (previewNotes && previewNotes.length > 0) {
      return previewNotes;
    }

    switch (resolvedPreviewMode) {
      case 'dynamic':
        return ['This preview executes client-side code and may differ from a full production build.'];
      case 'mocked':
        return ['Backend calls are simulated so the interface can be explored without a running server.'];
      case 'instructions':
        return ['This preview shows a guided representation. Review the runtime instructions to run the full experience.'];
      default:
        return ['This is a sandboxed preview of your generated experience. Behaviour may vary outside Prism.'];
    }
  }, [previewNotes, resolvedPreviewMode]);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Web App Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #0f172a;
            color: #e2e8f0;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Wrap JavaScript in try-catch for safety
          try {
            ${javascript}
          } catch (error) {
            console.error('Preview JavaScript Error:', error);
            document.body.innerHTML += '<div style="background: #fee; color: #c33; padding: 10px; margin: 10px 0; border-radius: 4px;">JavaScript Error: ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;

    const finalHtml = previewHtml || fallbackHtml;

    iframeDoc.open();
    iframeDoc.write(finalHtml);
    iframeDoc.close();
  }, [html, css, javascript, previewHtml]);

  const frame = (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      title="Web App Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );

  if (standalone) {
    return <div className={cn('w-full h-full', className)}>{frame}</div>;
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Live Preview</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {resolvedPreviewMode} preview
            </Badge>
            {stack?.framework && (
              <Badge variant="outline" className="text-xs">
                {stack.framework}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {showAlert && (
          <Alert className="mx-6 mb-4 border-yellow-500/30 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-300 text-sm space-y-1">
              {resolvedNotes.map((note, index) => (
                <div key={`${note}-${index}`}>{note}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden bg-white">
          {frame}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebAppPreview;
