
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GeneratedFile } from './types';

interface WebAppPreviewProps {
  files: GeneratedFile[];
}

const WebAppPreview = ({ files }: WebAppPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && files.length > 0) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Find the main HTML file
        const htmlFile = files.find(f => 
          f.language === 'html' || 
          f.filename.endsWith('.html') || 
          f.filename === 'index.html'
        );

        // Find CSS files
        const cssFiles = files.filter(f => 
          f.language === 'css' || 
          f.filename.endsWith('.css')
        );

        // Find JavaScript files
        const jsFiles = files.filter(f => 
          f.language === 'javascript' || 
          f.filename.endsWith('.js') ||
          f.language === 'typescript' || 
          f.filename.endsWith('.ts')
        );

        let fullHTML = '';

        if (htmlFile) {
          // Use the HTML file as base
          fullHTML = htmlFile.content;
          
          // Inject CSS into the HTML if not already included
          if (cssFiles.length > 0) {
            const cssContent = cssFiles.map(f => f.content).join('\n');
            if (!fullHTML.includes('<style>') && !fullHTML.includes('stylesheet')) {
              const styleTag = `<style>\n${cssContent}\n</style>`;
              if (fullHTML.includes('</head>')) {
                fullHTML = fullHTML.replace('</head>', `${styleTag}\n</head>`);
              } else {
                fullHTML = `<head>${styleTag}</head>${fullHTML}`;
              }
            }
          }

          // Inject JavaScript into the HTML if not already included
          if (jsFiles.length > 0) {
            const jsContent = jsFiles.map(f => f.content).join('\n');
            if (!fullHTML.includes('<script>')) {
              const scriptTag = `<script>\ntry {\n${jsContent}\n} catch (error) {\nconsole.error('Preview JavaScript Error:', error);\ndocument.body.innerHTML += '<div style="background: #fee; color: #c33; padding: 10px; margin: 10px 0; border-radius: 4px;">JavaScript Error: ' + error.message + '</div>';\n}\n</script>`;
              if (fullHTML.includes('</body>')) {
                fullHTML = fullHTML.replace('</body>', `${scriptTag}\n</body>`);
              } else {
                fullHTML = `${fullHTML}${scriptTag}`;
              }
            }
          }
        } else {
          // Fallback: create HTML from CSS and JS files
          const cssContent = cssFiles.map(f => f.content).join('\n');
          const jsContent = jsFiles.map(f => f.content).join('\n');

          fullHTML = `
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
                }
                ${cssContent}
              </style>
            </head>
            <body>
              <div id="app">
                <h1>Generated Web Application</h1>
                <p>This app was generated using AI. The preview shows the compiled result.</p>
              </div>
              <script>
                try {
                  ${jsContent}
                } catch (error) {
                  console.error('Preview JavaScript Error:', error);
                  document.body.innerHTML += '<div style="background: #fee; color: #c33; padding: 10px; margin: 10px 0; border-radius: 4px;">JavaScript Error: ' + error.message + '</div>';
                }
              </script>
            </body>
            </html>
          `;
        }
        
        iframeDoc.open();
        iframeDoc.write(fullHTML);
        iframeDoc.close();
      }
    }
  }, [files]);

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
          {files.length > 0 ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Web App Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files to preview</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebAppPreview;
