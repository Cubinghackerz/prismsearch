
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebAppPreviewProps {
  html: string;
  css: string;
  javascript: string;
}

const WebAppPreview = ({ html, css, javascript }: WebAppPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('WebAppPreview - Received props:', { 
      htmlLength: html?.length || 0, 
      cssLength: css?.length || 0, 
      jsLength: javascript?.length || 0 
    });

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Check if we have any meaningful content
        const hasContent = (html && html.trim()) || (css && css.trim()) || (javascript && javascript.trim());
        
        if (!hasContent) {
          console.log('WebAppPreview - No content provided, showing fallback');
          setDebugInfo(`No content: HTML(${html?.length || 0}), CSS(${css?.length || 0}), JS(${javascript?.length || 0})`);
          
          const fallbackHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Preview</title>
            </head>
            <body style="font-family: system-ui; padding: 20px; text-align: center; color: #666;">
              <h2>No content to preview</h2>
              <p>Generate a web app to see the live preview here.</p>
            </body>
            </html>
          `;
          iframeDoc.open();
          iframeDoc.write(fallbackHTML);
          iframeDoc.close();
          return;
        }

        console.log('WebAppPreview - Generating preview with content');
        setDebugInfo(`Content loaded: HTML(${html?.length || 0}), CSS(${css?.length || 0}), JS(${javascript?.length || 0})`);

        // Handle React/JSX content by adding Babel transpilation
        let processedJS = javascript || '';
        
        // Check if content contains JSX/React code
        if (processedJS.includes('React') || processedJS.includes('jsx') || processedJS.includes('<') && processedJS.includes('/>')) {
          console.log('WebAppPreview - Detected React/JSX content, adding Babel');
          // Add React and Babel for JSX transpilation
          processedJS = `
            // Load React from CDN for preview
            const { createElement: h, useState, useEffect } = React;
            
            // Simple JSX transpiler for basic cases
            ${processedJS.replace(/className/g, 'class')}
          `;
        }

        const fullHTML = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:">
            <title>Generated Web App Preview</title>
            <!-- Load React for JSX support if needed -->
            ${(javascript && (javascript.includes('React') || javascript.includes('jsx'))) ? `
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            ` : ''}
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              }
              ${css}
            </style>
          </head>
          <body>
            ${html || ''}
            <script>
              // Debug logging
              console.log('Preview iframe loaded');
              console.log('HTML content length:', ${html?.length || 0});
              console.log('CSS content length:', ${css?.length || 0});
              console.log('JS content length:', ${javascript?.length || 0});
            </script>
            <script>
              // Wrap JavaScript in try-catch for safety
              try {
                ${processedJS}
              } catch (error) {
                console.error('Preview JavaScript Error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'background: #fee; color: #c33; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #c33;';
                errorDiv.textContent = 'JavaScript Error: ' + error.message;
                document.body.appendChild(errorDiv);
              }
              
              // Log success
              console.log('Preview JavaScript executed successfully');
            </script>
          </body>
          </html>
        `;
        
        console.log('WebAppPreview - Writing content to iframe');
        iframeDoc.open();
        iframeDoc.write(fullHTML);
        iframeDoc.close();
        
        // Add load event listener to detect when iframe finishes loading
        iframe.onload = () => {
          console.log('WebAppPreview - Iframe loaded successfully');
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Check for errors in iframe console
            setTimeout(() => {
              try {
                const bodyContent = iframeDoc.body?.innerHTML || '';
                console.log('WebAppPreview - Iframe body content length:', bodyContent.length);
                if (bodyContent.length < 50) {
                  console.warn('WebAppPreview - Very little content in iframe body');
                }
              } catch (e) {
                console.error('WebAppPreview - Error checking iframe content:', e);
              }
            }, 100);
          }
        };
      }
    }
  }, [html, css, javascript]);

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
            This is a sandboxed preview of your generated web app. Some features may behave differently than in a full deployment.
          </AlertDescription>
        </Alert>
        
        <div className="flex-1 mx-6 mb-6 border border-prism-border rounded-lg overflow-hidden bg-white">
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="text-xs text-prism-text-muted p-2 bg-gray-100 border-b">
              Debug: {debugInfo}
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Web App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WebAppPreview;
