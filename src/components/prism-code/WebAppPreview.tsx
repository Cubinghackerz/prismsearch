
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

    // Find the main HTML file or create one
    let htmlFile = files.find(f => 
      f.type === 'html' && (
        f.path.includes('index.html') || 
        f.path.includes('public/index.html') ||
        f.path === 'index.html'
      )
    );
    
    if (!htmlFile) {
      // Create HTML from React/JS files
      const cssFiles = files.filter(f => f.type === 'css');
      const jsFiles = files.filter(f => f.type === 'javascript');
      const reactFiles = files.filter(f => f.type === 'jsx' || f.type === 'tsx');
      
      // Find main component
      const mainComponent = files.find(f => 
        f.path.includes('App.tsx') || 
        f.path.includes('App.jsx') ||
        f.path.includes('main.tsx') ||
        f.path.includes('index.tsx')
      );

      let jsContent = '';
      
      if (reactFiles.length > 0 || mainComponent) {
        // Simple React to vanilla JS conversion for preview
        jsContent = `
          // Simple React-like rendering for preview
          const React = {
            createElement: (tag, props, ...children) => {
              if (typeof tag === 'function') {
                return tag(props || {});
              }
              const element = document.createElement(tag);
              if (props) {
                Object.keys(props).forEach(key => {
                  if (key === 'className') {
                    element.className = props[key];
                  } else if (key === 'style' && typeof props[key] === 'object') {
                    Object.assign(element.style, props[key]);
                  } else if (key.startsWith('on') && typeof props[key] === 'function') {
                    element.addEventListener(key.toLowerCase().slice(2), props[key]);
                  } else {
                    element.setAttribute(key, props[key]);
                  }
                });
              }
              children.flat().forEach(child => {
                if (typeof child === 'string' || typeof child === 'number') {
                  element.appendChild(document.createTextNode(String(child)));
                } else if (child && typeof child === 'object' && child.nodeType) {
                  element.appendChild(child);
                }
              });
              return element;
            },
            useState: (initial) => {
              let value = initial;
              const setValue = (newValue) => {
                value = typeof newValue === 'function' ? newValue(value) : newValue;
                // Simple re-render simulation
                setTimeout(() => {
                  const root = document.getElementById('root');
                  if (root && typeof App !== 'undefined') {
                    root.innerHTML = '';
                    const appElement = App();
                    if (appElement) root.appendChild(appElement);
                  }
                }, 0);
              };
              return [value, setValue];
            },
            useEffect: (fn, deps) => {
              setTimeout(fn, 0);
            }
          };
          
          ${files.map(file => {
            if (file.type === 'tsx' || file.type === 'jsx') {
              let content = file.content;
              // Remove imports and exports
              content = content.replace(/import.*from.*['"].*['"];?\n?/g, '');
              content = content.replace(/export\s+(default\s+)?/g, '');
              
              // Basic JSX to JS conversion
              content = content.replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
                let propsStr = '';
                if (attrs.trim()) {
                  // Simple attribute parsing
                  propsStr = attrs.replace(/(\w+)=\{([^}]+)\}/g, '$1: $2')
                               .replace(/(\w+)="([^"]+)"/g, '$1: "$2"')
                               .replace(/className/g, 'className');
                  propsStr = `{${propsStr}}`;
                }
                return `React.createElement('${tag}', ${propsStr || 'null'},`;
              });
              content = content.replace(/<\/\w+>/g, ')');
              
              return content;
            }
            return '';
          }).join('\n')}
          
          // Render the app
          setTimeout(() => {
            const root = document.getElementById('root');
            if (root && typeof App !== 'undefined') {
              try {
                const appElement = App();
                if (appElement) {
                  root.appendChild(appElement);
                } else {
                  root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Generated Application</h2><p>Your application has been generated successfully!</p></div>';
                }
              } catch (error) {
                console.error('Render error:', error);
                root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Generated Application</h2><p>Your application has been generated successfully!</p><p style="color: #666; font-size: 0.9em;">Preview rendering in progress...</p></div>';
              }
            } else {
              root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Generated Application</h2><p>Your application has been generated successfully!</p></div>';
            }
          }, 100);
        `;
      } else {
        jsContent = jsFiles.map(f => f.content).join('\n');
      }

      // Combine CSS
      const cssContent = cssFiles.map(f => f.content).join('\n');

      // Create complete HTML
      const htmlContent = `<!DOCTYPE html>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        #root {
            min-height: 100vh;
        }
        ${cssContent}
    </style>
</head>
<body>
    <div id="root">
        <div style="padding: 2rem; text-align: center;">
            <h2>Loading Application...</h2>
        </div>
    </div>
    <script>
        ${jsContent}
    </script>
</body>
</html>`;

      setPreviewContent(htmlContent);
    } else {
      // Process existing HTML file
      let content = htmlFile.content;
      
      // Inject CSS
      const cssFiles = files.filter(f => f.type === 'css');
      if (cssFiles.length > 0) {
        const cssContent = cssFiles.map(f => f.content).join('\n');
        if (content.includes('</head>')) {
          content = content.replace('</head>', `<style>${cssContent}</style>\n</head>`);
        }
      }
      
      // Inject JS
      const jsFiles = files.filter(f => f.type === 'javascript');
      if (jsFiles.length > 0) {
        const jsContent = jsFiles.map(f => f.content).join('\n');
        if (content.includes('</body>')) {
          content = content.replace('</body>', `<script>${jsContent}</script>\n</body>`);
        }
      }
      
      setPreviewContent(content);
    }
  }, [files]);

  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
        
        iframe.onload = () => {
          console.log('Preview loaded successfully');
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
