
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";
import { GeneratedApp } from "@/types/webApp";

interface LivePreviewProps {
  generatedApp: GeneratedApp | null;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ 
  generatedApp, 
  isVisible = true,
  onToggleVisibility 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreviewHTML = (app: GeneratedApp): string => {
    try {
      // Find HTML file
      const htmlFile = app.files.find(f => 
        f.type === 'html' && (f.path.includes('index') || f.path.endsWith('.html'))
      );

      // Get CSS files
      const cssFiles = app.files.filter(f => f.type === 'css');
      const cssContent = cssFiles.map(f => f.content).join('\n');

      // Get JavaScript files (but not TypeScript/JSX for now)
      const jsFiles = app.files.filter(f => f.type === 'javascript');
      const jsContent = jsFiles.map(f => f.content).join('\n');

      if (htmlFile) {
        // Use existing HTML and inject CSS/JS
        let content = htmlFile.content;
        
        // Inject CSS
        if (cssContent) {
          content = content.replace(
            '</head>',
            `<style>${cssContent}</style>\n</head>`
          );
        }
        
        // Inject JS
        if (jsContent) {
          content = content.replace(
            '</body>',
            `<script>${jsContent}</script>\n</body>`
          );
        }
        
        return content;
      } else {
        // Create basic HTML structure
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app.framework} App Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .file-list {
            display: grid;
            gap: 1rem;
            margin-top: 2rem;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .file-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .file-name {
            font-family: monospace;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        .file-type {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        ${cssContent}
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 ${app.framework} Application</h1>
        <p>${app.description}</p>
        
        <div class="file-list">
            ${app.files.map(file => `
                <div class="file-item">
                    <div class="file-name">${file.path}</div>
                    <span class="file-type">${file.type}</span>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(34, 197, 94, 0.2); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <strong>✅ ${app.files.length} files generated successfully!</strong><br>
            Features: ${app.features.join(', ')}
        </div>
    </div>
    
    <script>
        console.log('${app.framework} App Preview Loaded');
        console.log('Files:', ${JSON.stringify(app.files.map(f => f.path))});
        ${jsContent}
    </script>
</body>
</html>`;
      }
    } catch (error) {
      console.error('Error creating preview HTML:', error);
      return `<!DOCTYPE html>
<html>
<head><title>Preview Error</title></head>
<body style="font-family: arial; padding: 20px; background: #f5f5f5;">
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
        <h2 style="color: #dc3545; margin: 0 0 10px 0;">Preview Error</h2>
        <p>Unable to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
</body>
</html>`;
    }
  };

  const refreshPreview = () => {
    if (!generatedApp) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const htmlContent = createPreviewHTML(generatedApp);
      setPreviewContent(htmlContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview';
      setError(errorMessage);
      console.error('Preview generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (generatedApp && isVisible) {
      refreshPreview();
    }
  }, [generatedApp, isVisible]);

  useEffect(() => {
    if (iframeRef.current && previewContent && !error) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        try {
          doc.open();
          doc.write(previewContent);
          doc.close();
        } catch (err) {
          console.error('Error writing to iframe:', err);
          setError('Failed to load preview content');
        }
      }
    }
  }, [previewContent, error]);

  if (!generatedApp) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-20">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Application Generated</h3>
          <p className="text-muted-foreground">Create a web app to see the live preview</p>
        </CardContent>
      </Card>
    );
  }

  if (!isVisible) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-20">
          <EyeOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Preview Hidden</h3>
          <p className="text-muted-foreground mb-4">Click to show the live preview</p>
          {onToggleVisibility && (
            <Button onClick={onToggleVisibility} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show Preview
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>Live Preview</span>
            <span className="text-sm text-muted-foreground">
              {generatedApp.framework} • {generatedApp.files.length} files
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshPreview}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {onToggleVisibility && (
              <Button onClick={onToggleVisibility} size="sm" variant="outline">
                <EyeOff className="w-4 h-4 mr-2" />
                Hide
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {error ? (
          <Alert className="m-4 border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Preview Error:</strong> {error}
              <Button 
                onClick={refreshPreview} 
                size="sm" 
                variant="outline" 
                className="mt-2 ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden border">
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
              style={{ minHeight: '400px' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LivePreview;
