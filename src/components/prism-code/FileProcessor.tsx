
import { GeneratedFile } from "@/types/webApp";

export class FileProcessor {
  static processFiles(files: GeneratedFile[]): string {
    console.log('Processing files for preview:', files.length);

    // Find the main HTML file or create one
    const htmlFile = files.find(f => f.type === 'html' && f.path.includes('index.html'));
    const entryFile = this.findEntryFile(files);
    
    if (htmlFile) {
      return this.enhanceExistingHTML(htmlFile, files);
    }
    
    return this.createCompleteHTML(files, entryFile);
  }

  private static findEntryFile(files: GeneratedFile[]): GeneratedFile | null {
    const entryPoints = ['App.tsx', 'App.jsx', 'main.tsx', 'index.tsx', 'src/App.tsx', 'src/main.tsx'];
    
    for (const entryPoint of entryPoints) {
      const file = files.find(f => f.path.includes(entryPoint) || f.path.endsWith(entryPoint));
      if (file) {
        console.log('Found entry file:', file.path);
        return file;
      }
    }
    
    // Fallback to any React component
    const reactFile = files.find(f => 
      (f.type === 'tsx' || f.type === 'jsx') && 
      (f.content.includes('export default') || f.content.includes('function ') || f.content.includes('const '))
    );
    
    if (reactFile) {
      console.log('Using fallback entry file:', reactFile.path);
    }
    
    return reactFile || null;
  }

  private static enhanceExistingHTML(htmlFile: GeneratedFile, allFiles: GeneratedFile[]): string {
    let html = htmlFile.content;
    
    // Process CSS files
    const cssFiles = allFiles.filter(f => f.type === 'css');
    const cssContent = cssFiles.map(f => f.content).join('\n');
    
    if (cssContent && !html.includes(cssContent)) {
      html = html.replace('</head>', `<style>${cssContent}</style>\n</head>`);
    }
    
    // Process JS files
    const processedJS = this.processJavaScriptFiles(allFiles);
    if (processedJS && !html.includes('window.React')) {
      html = html.replace('</body>', `<script>${processedJS}</script>\n</body>`);
    }
    
    return html;
  }

  private static createCompleteHTML(files: GeneratedFile[], entryFile: GeneratedFile | null): string {
    const cssFiles = files.filter(f => f.type === 'css');
    const cssContent = cssFiles.map(f => f.content).join('\n');
    const processedJS = this.processJavaScriptFiles(files);

    return `<!DOCTYPE html>
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
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 1rem;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #666;">Loading Application...</p>
        </div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    <script>
        console.log('Starting application with ${files.length} files...');
        ${processedJS}
        
        // Final render attempt
        setTimeout(() => {
            console.log('Final render attempt...');
            if (window.renderApp) {
                window.renderApp();
            } else {
                console.warn('No renderApp function found');
                const root = document.getElementById('root');
                if (root) {
                    root.innerHTML = '<div style="padding: 2rem; text-align: center;"><h2>Application Loaded</h2><p>No main component found to render</p></div>';
                }
            }
        }, 100);
    </script>
</body>
</html>`;
  }

  private static processJavaScriptFiles(files: GeneratedFile[]): string {
    const jsFiles = files.filter(f => ['tsx', 'jsx', 'typescript', 'javascript'].includes(f.type));
    
    if (jsFiles.length === 0) {
      console.log('No JavaScript files to process');
      return '';
    }

    let processedCode = this.createReactRuntime();
    
    // Process each file
    jsFiles.forEach(file => {
      console.log('Processing file:', file.path);
      try {
        const converted = this.convertFileToJS(file);
        processedCode += `\n// File: ${file.path}\n${converted}\n`;
      } catch (error) {
        console.error('Error processing file:', file.path, error);
        processedCode += `\n// Error processing ${file.path}: ${error.message}\n`;
      }
    });

    // Add rendering logic
    processedCode += this.createRenderingLogic();
    
    return processedCode;
  }

  private static createReactRuntime(): string {
    return `
// Simple React-like runtime
window.React = {
  createElement: function(type, props, ...children) {
    console.log('Creating element:', type, props);
    
    if (typeof type === 'function') {
      try {
        return type(props || {});
      } catch (error) {
        console.error('Component error:', error);
        const errorEl = document.createElement('div');
        errorEl.style.cssText = 'padding: 1rem; background: #fee; border: 1px solid #fcc; color: #c33;';
        errorEl.textContent = 'Error: ' + error.message;
        return errorEl;
      }
    }
    
    const element = document.createElement(type);
    
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === 'className') {
          element.className = props[key];
        } else if (key === 'style' && typeof props[key] === 'object') {
          Object.assign(element.style, props[key]);
        } else if (key.startsWith('on') && typeof props[key] === 'function') {
          const eventName = key.toLowerCase().slice(2);
          element.addEventListener(eventName, props[key]);
        } else if (key !== 'children') {
          element.setAttribute(key, String(props[key]));
        }
      });
    }
    
    children.forEach(child => {
      if (child == null) return;
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else if (child && child.nodeType) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  useState: function(initialValue) {
    let value = initialValue;
    const setValue = (newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
      setTimeout(() => window.renderApp && window.renderApp(), 0);
    };
    return [() => value, setValue];
  },
  
  useEffect: function(effect, deps) {
    setTimeout(effect, 0);
  }
};

window.useState = window.React.useState;
window.useEffect = window.React.useEffect;
`;
  }

  private static convertFileToJS(file: GeneratedFile): string {
    let content = file.content;
    
    // Remove imports/exports
    content = content.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');
    content = content.replace(/export\s+default\s+/g, '');
    content = content.replace(/export\s+/g, '');
    
    // Remove TypeScript types
    content = content.replace(/:\s*\w+(\[\])?(?=\s*[=,\)\{\}])/g, '');
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
    content = content.replace(/type\s+\w+\s*=.*?;/g, '');
    
    // Convert JSX to function calls - simple approach
    content = this.convertJSX(content);
    
    return content;
  }

  private static convertJSX(content: string): string {
    // Handle JSX elements - very basic conversion
    // This is a simplified approach for common patterns
    
    // Convert <div className="..." to React.createElement('div', {className: '...'
    content = content.replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
      const props = this.parseJSXAttributes(attrs);
      return `React.createElement('${tag}', ${props}, `;
    });
    
    // Handle self-closing tags
    content = content.replace(/<(\w+)([^>]*?)\/>/g, (match, tag, attrs) => {
      const props = this.parseJSXAttributes(attrs);
      return `React.createElement('${tag}', ${props})`;
    });
    
    // Close tags
    content = content.replace(/<\/\w+>/g, ')');
    
    return content;
  }

  private static parseJSXAttributes(attrs: string): string {
    if (!attrs || !attrs.trim()) return 'null';
    
    const props: string[] = [];
    
    // Handle className
    const classMatch = attrs.match(/className=["']([^"']+)["']/);
    if (classMatch) {
      props.push(`className: "${classMatch[1]}"`);
    }
    
    // Handle other simple attributes
    const attrMatches = attrs.matchAll(/(\w+)=["']([^"']+)["']/g);
    for (const match of attrMatches) {
      if (match[1] !== 'className') {
        props.push(`${match[1]}: "${match[2]}"`);
      }
    }
    
    return props.length > 0 ? `{${props.join(', ')}}` : 'null';
  }

  private static createRenderingLogic(): string {
    return `
window.renderApp = function() {
  console.log('Rendering app...');
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }
  
  try {
    root.innerHTML = '';
    
    // Try to find and render the main component
    const componentNames = ['App', 'MainApp', 'Application'];
    let rendered = false;
    
    for (const name of componentNames) {
      if (typeof window[name] === 'function') {
        console.log('Found component:', name);
        const result = window[name]();
        if (result && result.nodeType) {
          root.appendChild(result);
          rendered = true;
          break;
        }
      }
    }
    
    if (!rendered) {
      console.log('No main component found, showing default content');
      root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Application Loaded</h2><p>React components processed successfully</p></div>';
    }
    
  } catch (error) {
    console.error('Render error:', error);
    root.innerHTML = '<div style="padding: 2rem; text-align: center; color: #dc2626;"><h2>Rendering Error</h2><p>' + error.message + '</p></div>';
  }
};
`;
  }
}
