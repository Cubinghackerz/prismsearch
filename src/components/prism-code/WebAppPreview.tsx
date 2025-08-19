
import React, { useEffect, useRef, useState } from "react";
import { GeneratedFile } from "@/types/webApp";
import { FileProcessor } from "./FileProcessor";

interface WebAppPreviewProps {
  files: GeneratedFile[];
}

const WebAppPreview: React.FC<WebAppPreviewProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewContent("");
      setError(null);
      return;
    }

    console.log('WebAppPreview: Processing files for preview:', files.length);
    setIsLoading(true);
    setError(null);

    try {
      const processedHTML = FileProcessor.processFiles(files);
      console.log('WebAppPreview: Generated HTML length:', processedHTML.length);
      setPreviewContent(processedHTML);
    } catch (error) {
      console.error('WebAppPreview: Error processing files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setPreviewContent(createErrorHTML(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const createErrorHTML = (errorMessage: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Error</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 2rem;
            background: #f9f9f9;
            margin: 0;
        }
        .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
        }
        code {
            background: #f3f4f6;
            padding: 0.5rem;
            border-radius: 4px;
            display: block;
            word-break: break-word;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h2 style="color: #dc2626; margin-bottom: 1rem;">Preview Generation Error</h2>
        <p style="margin-bottom: 1rem;">There was an issue generating the preview:</p>
        <code>${errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
            Try regenerating the application or check the console for more details.
        </p>
    </div>
</body>
</html>`;
  };

  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const iframe = iframeRef.current;
      
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          doc.open();
          doc.write(previewContent);
          doc.close();
          
          // Add error handling to the iframe
          iframe.onload = () => {
            try {
              const iframeWindow = iframe.contentWindow;
              if (iframeWindow) {
                // Type assertion to access console properties
                const iframeConsole = (iframeWindow as any).console;
                
                if (iframeConsole) {
                  // Capture console logs from iframe
                  const originalLog = iframeConsole.log;
                  const originalError = iframeConsole.error;
                  const originalWarn = iframeConsole.warn;
                  
                  iframeConsole.log = (...args: any[]) => {
                    console.log('Preview Log:', ...args);
                    if (originalLog) originalLog.apply(iframeConsole, args);
                  };
                  
                  iframeConsole.error = (...args: any[]) => {
                    console.error('Preview Error:', ...args);
                    if (originalError) originalError.apply(iframeConsole, args);
                  };
                  
                  iframeConsole.warn = (...args: any[]) => {
                    console.warn('Preview Warning:', ...args);
                    if (originalWarn) originalWarn.apply(iframeConsole, args);
                  };
                }
                
                iframeWindow.onerror = (msg, url, line, col, error) => {
                  console.error('Preview runtime error:', { msg, url, line, col, error });
                };
                
                iframeWindow.addEventListener('unhandledrejection', (event) => {
                  console.error('Preview unhandled promise rejection:', event.reason);
                });
              }
              console.log('Preview loaded successfully');
            } catch (e) {
              console.warn('Could not add error handlers to iframe:', e);
            }
          };
        }
      } catch (error) {
        console.error('Error writing to iframe:', error);
      }
    }
  }, [previewContent]);

  if (!files || files.length === 0) {
    return (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-prism-border flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Application Generated</h3>
          <p className="text-gray-500">Generate an application to see the live preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-prism-border relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prism-primary mx-auto mb-2"></div>
            <p className="text-prism-text-muted">Processing application...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm z-10">
          Preview Error: {error}
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Live Application Preview"
      />
    </div>
  );
};

export default WebAppPreview;
