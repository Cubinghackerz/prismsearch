
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebAppPreviewProps {
  html: string;
  css: string;
  javascript: string;
  onConsoleMessage?: (message: string, type?: 'log' | 'error' | 'warn') => void;
}

const WebAppPreview = ({ html, css, javascript, onConsoleMessage }: WebAppPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    onConsoleMessage?.('Building preview application...');

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Always try to build preview, even with minimal content
        const hasHtml = html && html.trim();
        const hasCss = css && css.trim();
        const hasJs = javascript && javascript.trim();
        
        onConsoleMessage?.(`Building with content: HTML(${hasHtml ? 'YES' : 'NO'}), CSS(${hasCss ? 'YES' : 'NO'}), JS(${hasJs ? 'YES' : 'NO'})`);
        
        // Build the complete HTML document
        let completeHTML = '';
        
        if (hasHtml) {
          // Use provided HTML as base
          completeHTML = html;
          
          // If CSS is provided separately, inject it
          if (hasCss && !html.includes('<style>') && !html.includes('stylesheet')) {
            completeHTML = completeHTML.replace(
              '</head>', 
              `<style>${css}</style>\n</head>`
            );
          }
          
          // If JavaScript is provided separately, inject it
          if (hasJs && !html.includes('<script>')) {
            completeHTML = completeHTML.replace(
              '</body>', 
              `<script>${javascript}</script>\n</body>`
            );
          }
        } else {
          // Build HTML from scratch
          completeHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Generated Web App</title>
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:;">
              ${hasCss ? `<style>${css}</style>` : ''}
            </head>
            <body>
              ${hasJs || hasCss ? '<div id="app">Loading...</div>' : '<h1>Hello World</h1><p>Your web app will appear here.</p>'}
              ${hasJs ? `<script>${javascript}</script>` : ''}
            </body>
            </html>
          `;
        }
        
        // Ensure we have valid HTML structure
        if (!completeHTML.includes('<!DOCTYPE html>')) {
          completeHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Generated Web App</title>
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:;">
            </head>
            <body>
              ${completeHTML}
            </body>
            </html>
          `;
        }
        
        onConsoleMessage?.('Writing complete HTML document to iframe...');
        
        try {
          iframeDoc.open();
          iframeDoc.write(completeHTML);
          iframeDoc.close();
          
          onConsoleMessage?.('Preview iframe content written successfully');
          setIsLoading(false);
          
          // Set up iframe load listener first
          iframe.onload = () => {
            onConsoleMessage?.('Preview loaded successfully');
            setIsLoading(false);
            
            // Verify content after load
            setTimeout(() => {
              try {
                const bodyText = iframeDoc.body?.textContent || '';
                if (bodyText.trim().length > 0) {
                  onConsoleMessage?.(`Content verified: ${bodyText.length} characters rendered`);
                } else {
                  onConsoleMessage?. ('Warning: No visible content detected', 'warn');
                }
              } catch (e) {
                onConsoleMessage?.('Error verifying content', 'error');
              }
            }, 500);
          };
          
          // Set up message listener for console output
          const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'console') {
              onConsoleMessage?.(event.data.message, event.data.level);
            }
          };
          window.addEventListener('message', handleMessage);
          
          // Write content to iframe
          try {
            iframeDoc.open();
            iframeDoc.write(completeHTML);
            iframeDoc.close();
          } catch (error) {
            onConsoleMessage?.(`Error writing to iframe: ${error.message}`, 'error');
          }
          
          // Cleanup function
          return () => {
            window.removeEventListener('message', handleMessage);
          };
        } catch (error) {
          onConsoleMessage?.(`Preview generation error: ${error.message}`, 'error');
          setIsLoading(false);
        }
      }
    }
  }, [html, css, javascript, onConsoleMessage]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Live Preview</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Alert className="mx-6 mb-4 border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-300 text-sm">
            This is a locally hosted preview of your generated web app. Full interactivity and real-time console output are enabled.
          </AlertDescription>
        </Alert>
        
        <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prism-primary mx-auto mb-2"></div>
                <p className="text-sm text-prism-text-muted">Building preview...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Web App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WebAppPreview;
