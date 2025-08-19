
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
          onConsoleMessage?.('No content provided, showing fallback message', 'warn');
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
        onConsoleMessage?.(`Building preview: HTML(${html?.length || 0} chars), CSS(${css?.length || 0} chars), JS(${javascript?.length || 0} chars)`);
        setDebugInfo(`Content loaded: HTML(${html?.length || 0}), CSS(${css?.length || 0}), JS(${javascript?.length || 0})`);

        // Handle React/JSX content by adding Babel transpilation
        let processedJS = javascript || '';
        
        // Check if content contains JSX/React code
        if (processedJS.includes('React') || processedJS.includes('jsx') || (processedJS.includes('<') && processedJS.includes('/>'))) {
          console.log('WebAppPreview - Detected React/JSX content, adding Babel');
          onConsoleMessage?.('Detected React/JSX content, setting up transpilation');
          
          // For React components, we need to handle JSX properly
          processedJS = `
            // React app initialization
            try {
              ${processedJS}
            } catch (error) {
              console.error('React component error:', error);
              throw error;
            }
          `;
        }

        // Enhanced HTML with better error handling and console capture
        const fullHTML = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:;">
            <title>Generated Web App Preview</title>
            
            <!-- Load React and other libraries if needed -->
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
                line-height: 1.6;
              }
              
              /* Error display styles */
              .preview-error {
                background: #fee;
                color: #c33;
                padding: 15px;
                margin: 15px 0;
                border-radius: 6px;
                border: 1px solid #c33;
                font-family: monospace;
                font-size: 14px;
                white-space: pre-wrap;
              }
              
              ${css || ''}
            </style>
          </head>
          <body>
            ${html || ''}
            
            <script>
              // Enhanced console capture and error handling
              const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                info: console.info
              };
              
              // Override console methods to capture output
              console.log = function(...args) {
                originalConsole.log.apply(console, args);
                try {
                  window.parent.postMessage({
                    type: 'console',
                    level: 'log',
                    message: args.map(arg => 
                      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ')
                  }, '*');
                } catch(e) {}
              };
              
              console.error = function(...args) {
                originalConsole.error.apply(console, args);
                try {
                  window.parent.postMessage({
                    type: 'console',
                    level: 'error',
                    message: args.map(arg => 
                      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ')
                  }, '*');
                } catch(e) {}
              };
              
              console.warn = function(...args) {
                originalConsole.warn.apply(console, args);
                try {
                  window.parent.postMessage({
                    type: 'console',
                    level: 'warn',
                    message: args.map(arg => 
                      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ')
                  }, '*');
                } catch(e) {}
              };

              // Global error handler
              window.onerror = function(message, source, lineno, colno, error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'preview-error';
                errorDiv.textContent = \`JavaScript Error: \${message}\nLine: \${lineno}, Column: \${colno}\`;
                document.body.appendChild(errorDiv);
                
                console.error('Global error caught:', message, 'at', source, lineno, colno);
                return false;
              };

              // Unhandled promise rejection handler
              window.addEventListener('unhandledrejection', function(event) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'preview-error';
                errorDiv.textContent = \`Unhandled Promise Rejection: \${event.reason}\`;
                document.body.appendChild(errorDiv);
                
                console.error('Unhandled promise rejection:', event.reason);
              });

              // Initial load message
              console.log('🚀 Preview application loaded successfully');
              console.log('📊 Content stats:', {
                html: ${html?.length || 0},
                css: ${css?.length || 0}, 
                javascript: ${javascript?.length || 0}
              });
            </script>
            
            <script>
              // Main application script with enhanced error handling
              try {
                ${processedJS}
                console.log('✅ Application JavaScript executed successfully');
              } catch (error) {
                console.error('❌ Application JavaScript Error:', error);
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'preview-error';
                errorDiv.innerHTML = \`
                  <strong>JavaScript Execution Error:</strong><br>
                  \${error.message}<br><br>
                  <strong>Stack:</strong><br>
                  \${error.stack || 'No stack trace available'}
                \`;
                document.body.appendChild(errorDiv);
                
                throw error;
              }
            </script>
          </body>
          </html>
        `;
        
        console.log('WebAppPreview - Writing enhanced content to iframe');
        onConsoleMessage?.('Writing application content to preview iframe');
        
        iframeDoc.open();
        iframeDoc.write(fullHTML);
        iframeDoc.close();
        
        // Set up message listener for console output from iframe
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'console') {
            onConsoleMessage?.(event.data.message, event.data.level);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Add load event listener
        iframe.onload = () => {
          console.log('WebAppPreview - Iframe loaded successfully');
          onConsoleMessage?.('Preview iframe loaded and ready for interaction');
          
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Check content after a brief delay
            setTimeout(() => {
              try {
                const bodyContent = iframeDoc.body?.innerHTML || '';
                console.log('WebAppPreview - Iframe body content length:', bodyContent.length);
                onConsoleMessage?.(`Preview content rendered: ${bodyContent.length} characters`);
                
                if (bodyContent.length < 50) {
                  console.warn('WebAppPreview - Very little content in iframe body');
                  onConsoleMessage?.('Warning: Very little content rendered in preview', 'warn');
                }
              } catch (e) {
                console.error('WebAppPreview - Error checking iframe content:', e);
                onConsoleMessage?.('Error checking preview content', 'error');
              }
            }, 100);
          }
        };

        // Cleanup function
        return () => {
          window.removeEventListener('message', handleMessage);
        };
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
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WebAppPreview;
