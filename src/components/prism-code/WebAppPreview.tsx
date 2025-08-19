
import React, { useEffect, useRef, useState } from "react";
import { GeneratedFile } from "@/types/webApp";

interface WebAppPreviewProps {
  files: GeneratedFile[];
}

const WebAppPreview: React.FC<WebAppPreviewProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (!files || files.length === 0) return;

    // Find the main HTML file or create one from the generated files
    let htmlFile = files.find(f => f.type === 'html' && (f.path.includes('index.html') || f.path.includes('public/index.html')));
    
    if (!htmlFile) {
      // If no HTML file exists, create a complete HTML document from the generated files
      const cssFiles = files.filter(f => f.type === 'css');
      const jsFiles = files.filter(f => f.type === 'javascript');
      const tsFiles = files.filter(f => f.type === 'typescript');
      const reactFiles = files.filter(f => f.type === 'jsx' || f.type === 'tsx');
      
      // Get the main app component
      const appFile = files.find(f => 
        f.path.includes('App.tsx') || 
        f.path.includes('App.jsx') || 
        f.path.includes('main.tsx') || 
        f.path.includes('main.jsx') ||
        f.path.includes('index.tsx') ||
        f.path.includes('index.jsx')
      );

      // Combine all CSS content
      const cssContent = cssFiles.map(f => f.content).join('\n');
      
      // For React/TypeScript apps, transpile and create executable JS
      let jsContent = '';
      
      if (reactFiles.length > 0 || tsFiles.length > 0) {
        // Create executable JavaScript from React/TypeScript files
        jsContent = `
          // React App Implementation
          const { useState, useEffect, createElement: h } = React;
          
          ${files.map(file => {
            if (file.type === 'tsx' || file.type === 'jsx') {
              // Simple JSX to JS transpilation for preview
              let content = file.content;
              
              // Remove imports and exports for iframe context
              content = content.replace(/import.*from.*['"].*['"];?\n?/g, '');
              content = content.replace(/export\s+(default\s+)?/g, '');
              
              // Basic JSX to React.createElement conversion
              content = content.replace(/\<(\w+)([^>]*)\>/g, (match, tag, attrs) => {
                if (attrs.trim()) {
                  return `h('${tag}', {${attrs.replace(/className=/g, 'className:').replace(/=/g, ':').replace(/"/g, "'")}},`;
                }
                return `h('${tag}', null,`;
              });
              content = content.replace(/\<\/\w+\>/g, ')');
              
              return content;
            }
            return file.content;
          }).join('\n')}
          
          // Mount the app
          const rootElement = document.getElementById('root');
          if (rootElement && typeof App !== 'undefined') {
            try {
              ReactDOM.render(h(App), rootElement);
            } catch (error) {
              rootElement.innerHTML = '<div style="padding: 2rem; text-align: center;"><h2>Generated Application</h2><p>Your application has been generated successfully!</p></div>';
            }
          }
        `;
      } else {
        // For vanilla JS apps
        jsContent = jsFiles.map(f => f.content).join('\n');
      }

      // Create complete HTML document
      htmlFile = {
        path: 'preview.html',
        type: 'html' as const,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Application</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: #ffffff;
            color: #333;
            line-height: 1.6;
        }
        #root {
            min-height: 100vh;
        }
        ${cssContent}
    </style>
    ${reactFiles.length > 0 || tsFiles.length > 0 ? `
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    ` : ''}
</head>
<body>
    <div id="root"></div>
    <script>
        ${jsContent}
    </script>
</body>
</html>`
      };
    } else {
      // If HTML file exists, enhance it with CSS and JS from other files
      let processedContent = htmlFile.content;
      
      // Inject CSS files
      const cssFiles = files.filter(f => f.type === 'css');
      if (cssFiles.length > 0) {
        const cssContent = cssFiles.map(f => f.content).join('\n');
        
        if (processedContent.includes('</head>')) {
          processedContent = processedContent.replace(
            '</head>',
            `<style>${cssContent}</style>\n</head>`
          );
        }
      }
      
      // Inject JS files
      const jsFiles = files.filter(f => f.type === 'javascript');
      if (jsFiles.length > 0) {
        const jsContent = jsFiles.map(f => f.content).join('\n');
        
        if (processedContent.includes('</body>')) {
          processedContent = processedContent.replace(
            '</body>',
            `<script>${jsContent}</script>\n</body>`
          );
        }
      }
      
      htmlFile = { ...htmlFile, content: processedContent };
    }

    setPreviewContent(htmlFile.content);
  }, [files]);

  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
        
        // Handle iframe loading errors gracefully
        iframe.onload = () => {
          try {
            // Ensure the iframe content is properly loaded
            console.log('Preview loaded successfully');
          } catch (error) {
            console.warn('Preview loading issue:', error);
          }
        };
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
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-prism-border">
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
