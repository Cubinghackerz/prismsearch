
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { GeneratedApp } from '@/types/webApp';

interface LivePreviewProps {
  app: GeneratedApp;
}

const LivePreview: React.FC<LivePreviewProps> = ({ app }) => {
  const createPreviewContent = () => {
    // Find the main HTML file
    const htmlFile = app.files.find(file => file.type === 'html') || 
                    { content: app.html || '<div>No HTML content available</div>' };
    
    // Find the main CSS file
    const cssFile = app.files.find(file => file.type === 'css') || 
                   { content: app.css || '' };
    
    // Find the main JS file
    const jsFile = app.files.find(file => file.type === 'javascript' || file.type === 'typescript') || 
                  { content: app.javascript || '' };

    // Create a complete HTML document for preview
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          ${cssFile.content}
        </style>
      </head>
      <body>
        ${htmlFile.content}
        <script>
          ${jsFile.content}
        </script>
      </body>
      </html>
    `;

    return previewHtml;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Live Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <iframe
            srcDoc={createPreviewContent()}
            className="w-full h-96 border-0"
            title="App Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePreview;
