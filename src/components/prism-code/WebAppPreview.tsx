
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

    // Find main HTML file or create one from React/Vue components
    let htmlFile = files.find(f => f.type === 'html' && (f.path.includes('index.html') || f.path.endsWith('.html')));
    
    if (!htmlFile) {
      // Try to create preview from framework files
      const reactApp = files.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
      const vueApp = files.find(f => f.path.includes('App.vue'));
      const mainFile = files.find(f => f.path.includes('main.') || f.path.includes('index.'));
      
      if (reactApp || vueApp || mainFile) {
        // Create a basic HTML preview for framework apps
        const cssFiles = files.filter(f => f.type === 'css');
        const jsFiles = files.filter(f => f.type === 'javascript');
        const tsFiles = files.filter(f => f.type === 'typescript');
        
        const cssContent = cssFiles.map(f => f.content).join('\n');
        const jsContent = jsFiles.map(f => f.content).join('\n');
        
        htmlFile = {
          path: 'preview.html',
          type: 'html' as const,
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App Preview</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        ${cssContent}
    </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root">
        <div style="padding: 2rem; text-align: center;">
            <h1 style="color: #333; margin-bottom: 1rem;">Generated Application Preview</h1>
            <p style="color: #666; margin-bottom: 2rem;">This is a preview of your generated ${files.find(f => f.path.includes('package.json'))?.content.includes('"react"') ? 'React' : 'JavaScript'} application.</p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 2rem 0;">
                <h3 style="margin: 0 0 1rem 0; color: #333;">Files Generated:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${files.map(f => `<li style="margin: 0.5rem 0; padding: 0.5rem; background: white; border-radius: 4px; font-family: monospace;">${f.path}</li>`).join('')}
                </ul>
            </div>
            <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1976d2; font-weight: 500;">💡 This is a basic preview. Download the files to run the full application with all features and dependencies.</p>
            </div>
        </div>
    </div>
    <script type="text/babel">
        ${reactApp ? `
        // Basic React component preview
        const App = () => {
            return React.createElement('div', { 
                style: { 
                    padding: '2rem', 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                } 
            }, [
                React.createElement('h1', { key: 'title', style: { fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' } }, 'Your Generated App'),
                React.createElement('p', { key: 'subtitle', style: { fontSize: '1.2rem', textAlign: 'center', opacity: 0.9 } }, 'React TypeScript Application'),
                React.createElement('div', { key: 'features', style: { marginTop: '2rem', textAlign: 'center' } }, [
                    React.createElement('h3', { key: 'features-title' }, 'Features:'),
                    React.createElement('ul', { key: 'features-list', style: { listStyle: 'none', padding: 0 } }, 
                        ['Modern React Components', 'TypeScript Support', 'Responsive Design', 'Professional Styling'].map((feature, i) =>
                            React.createElement('li', { key: i, style: { margin: '0.5rem 0', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }, feature)
                        )
                    )
                ])
            ]);
        };
        
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
        ` : jsContent}
    </script>
</body>
</html>`
        };
      }
    }

    if (!htmlFile) {
      // Fallback: create a file listing preview
      setPreviewContent(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Files</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 { color: #333; text-align: center; margin-bottom: 2rem; }
        .file-list {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        .file-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.2s;
        }
        .file-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .file-name {
            font-family: monospace;
            font-weight: bold;
            color: #495057;
            margin-bottom: 0.5rem;
        }
        .file-type {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generated Application Files</h1>
        <div class="file-list">
            ${files.map(file => `
                <div class="file-item">
                    <div class="file-name">${file.path}</div>
                    <span class="file-type">${file.type}</span>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; color: #155724;">
            <strong>📁 ${files.length} files generated successfully!</strong><br>
            Download the files to run your complete application with all dependencies and features.
        </div>
    </div>
</body>
</html>`);
      return;
    }

    // Process HTML content and inject CSS/JS from other files
    let processedContent = htmlFile.content;
    
    // Find CSS files and inject them
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
    
    // Find JS files and inject them
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

    setPreviewContent(processedContent);
  }, [files]);

  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
      }
    }
  }, [previewContent]);

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-prism-border">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Web App Preview"
      />
    </div>
  );
};

export default WebAppPreview;
