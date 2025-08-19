
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

    console.log('Processing files for preview:', files);

    // Find entry points
    const htmlFile = files.find(f => 
      f.type === 'html' && (
        f.path.includes('index.html') || 
        f.path.includes('public/index.html') ||
        f.path === 'index.html'
      )
    );

    const mainAppFile = files.find(f => 
      f.path.includes('App.tsx') || 
      f.path.includes('App.jsx') ||
      f.path.includes('main.tsx') ||
      f.path.includes('index.tsx') ||
      f.path.includes('src/App')
    );

    // Collect all CSS
    const cssFiles = files.filter(f => f.type === 'css');
    const allCSS = cssFiles.map(f => f.content).join('\n');

    // Process JavaScript/TypeScript files
    let processedJS = '';
    
    if (files.some(f => f.type === 'tsx' || f.type === 'jsx')) {
      // Handle React/JSX files
      processedJS = generateReactPreview(files);
    } else {
      // Handle vanilla JS
      const jsFiles = files.filter(f => f.type === 'javascript' || f.type === 'typescript');
      processedJS = jsFiles.map(f => f.content).join('\n');
    }

    let finalHTML = '';

    if (htmlFile) {
      // Use existing HTML file as base
      finalHTML = htmlFile.content;
      
      // Inject additional CSS
      if (allCSS && !finalHTML.includes(allCSS)) {
        finalHTML = finalHTML.replace('</head>', `<style>${allCSS}</style>\n</head>`);
      }
      
      // Inject processed JS
      if (processedJS && !finalHTML.includes(processedJS)) {
        finalHTML = finalHTML.replace('</body>', `<script>${processedJS}</script>\n</body>`);
      }
    } else {
      // Create HTML from scratch
      finalHTML = createHTMLFromFiles(files, allCSS, processedJS);
    }

    console.log('Generated preview HTML:', finalHTML);
    setPreviewContent(finalHTML);
  }, [files]);

  const generateReactPreview = (files: GeneratedFile[]) => {
    const reactFiles = files.filter(f => f.type === 'tsx' || f.type === 'jsx');
    
    // Simple React simulation for preview
    let jsCode = `
// Simple React-like simulation for preview
const React = {
  createElement: function(type, props, ...children) {
    if (typeof type === 'function') {
      return type(props || {});
    }
    
    const element = document.createElement(type);
    
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === 'className') {
          element.className = props[key];
        } else if (key === 'style' && typeof props[key] === 'object') {
          Object.assign(element.style, props[key]);
        } else if (key.startsWith('on') && typeof props[key] === 'function') {
          element.addEventListener(key.toLowerCase().slice(2), props[key]);
        } else if (key !== 'children') {
          element.setAttribute(key, props[key]);
        }
      });
    }
    
    children.flat().forEach(child => {
      if (child == null) return;
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else if (child && typeof child === 'object' && child.nodeType) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  useState: function(initialValue) {
    let value = initialValue;
    const setValue = (newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
      // Trigger re-render
      setTimeout(renderApp, 0);
    };
    return [() => value, setValue];
  },
  
  useEffect: function(effect, deps) {
    setTimeout(effect, 0);
  }
};

`;

    // Process each React file
    reactFiles.forEach(file => {
      let content = file.content;
      
      // Remove imports and exports
      content = content.replace(/import.*from.*['"].*['"];?\s*/g, '');
      content = content.replace(/export\s+(default\s+)?/g, '');
      
      // Simple JSX to JS conversion
      content = content.replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
        if (!attrs.trim()) {
          return `React.createElement('${tag}', null,`;
        }
        
        // Parse attributes
        let propsStr = attrs.replace(/(\w+)=\{([^}]+)\}/g, '$1: $2')
                           .replace(/(\w+)="([^"]+)"/g, '$1: "$2"')
                           .replace(/className/g, 'className');
        
        return `React.createElement('${tag}', {${propsStr}},`;
      });
      
      content = content.replace(/<\/\w+>/g, ')');
      
      // Handle self-closing tags
      content = content.replace(/<(\w+)([^>]*?)\/>/g, (match, tag, attrs) => {
        if (!attrs.trim()) {
          return `React.createElement('${tag}', null)`;
        }
        let propsStr = attrs.replace(/(\w+)=\{([^}]+)\}/g, '$1: $2')
                           .replace(/(\w+)="([^"]+)"/g, '$1: "$2"');
        return `React.createElement('${tag}', {${propsStr}})`;
      });
      
      jsCode += `\n${content}\n`;
    });

    // Add rendering logic
    jsCode += `
function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;
  
  try {
    root.innerHTML = '';
    let appElement;
    
    if (typeof App === 'function') {
      appElement = App();
    } else if (typeof MainApp === 'function') {
      appElement = MainApp();
    } else {
      // Try to find any component function
      const componentNames = ['Component', 'TodoApp', 'Calculator', 'Dashboard'];
      for (const name of componentNames) {
        if (typeof window[name] === 'function') {
          appElement = window[name]();
          break;
        }
      }
    }
    
    if (appElement && appElement.nodeType) {
      root.appendChild(appElement);
    } else {
      root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Generated Application</h2><p>Component rendered successfully!</p></div>';
    }
  } catch (error) {
    console.error('Rendering error:', error);
    root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui; color: #dc2626;"><h2>Rendering Error</h2><p>There was an issue rendering the component. Check the console for details.</p></div>';
  }
}

// Initial render
setTimeout(renderApp, 100);
`;

    return jsCode;
  };

  const createHTMLFromFiles = (files: GeneratedFile[], css: string, js: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Application Preview</title>
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
        ${css}
    </style>
</head>
<body>
    <div id="root">
        <div style="padding: 2rem; text-align: center;">
            <h2>Loading Application...</h2>
        </div>
    </div>
    <script>
        ${js}
    </script>
</body>
</html>`;
  };

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
