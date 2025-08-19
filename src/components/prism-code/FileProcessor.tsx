
import { GeneratedFile } from "@/types/webApp";

export class FileProcessor {
  static processFiles(files: GeneratedFile[]): string {
    console.log('Processing files:', files);

    // Find entry points and organize files
    const entryFile = this.findEntryFile(files);
    const htmlFile = files.find(f => f.type === 'html' && f.path.includes('index.html'));
    
    // Process different file types
    const processedJS = this.processJavaScriptFiles(files);
    const processedCSS = this.processCSSFiles(files);
    
    if (htmlFile) {
      return this.enhanceExistingHTML(htmlFile.content, processedCSS, processedJS);
    }
    
    return this.createHTMLFromScratch(files, processedCSS, processedJS, entryFile);
  }

  private static findEntryFile(files: GeneratedFile[]): GeneratedFile | null {
    const entryPoints = ['App.tsx', 'App.jsx', 'main.tsx', 'index.tsx', 'src/App.tsx', 'src/main.tsx'];
    
    for (const entryPoint of entryPoints) {
      const file = files.find(f => f.path.includes(entryPoint));
      if (file) return file;
    }
    
    // Fallback to any React component
    return files.find(f => (f.type === 'tsx' || f.type === 'jsx') && f.content.includes('export default')) || null;
  }

  private static processJavaScriptFiles(files: GeneratedFile[]): string {
    const jsFiles = files.filter(f => ['tsx', 'jsx', 'typescript', 'javascript'].includes(f.type));
    
    if (jsFiles.length === 0) return '';

    let processedCode = this.createReactRuntime();
    
    // Process each file and convert to runnable JavaScript
    jsFiles.forEach(file => {
      const converted = this.convertToJavaScript(file);
      processedCode += `\n${converted}\n`;
    });

    // Add rendering logic
    processedCode += this.createRenderingLogic();
    
    return processedCode;
  }

  private static createReactRuntime(): string {
    return `
// React-like runtime for preview
window.React = {
  createElement: function(type, props, ...children) {
    if (typeof type === 'function') {
      try {
        const result = type(props || {});
        return result;
      } catch (error) {
        console.error('Component error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c33; font-family: monospace;';
        errorDiv.textContent = 'Component Error: ' + error.message;
        return errorDiv;
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
        } else if (key !== 'children' && key !== 'key') {
          try {
            element.setAttribute(key, String(props[key]));
          } catch (e) {
            console.warn('Failed to set attribute:', key, props[key]);
          }
        }
      });
    }
    
    children.flat().forEach(child => {
      if (child == null || child === false) return;
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)));
      } else if (child && typeof child === 'object' && child.nodeType) {
        element.appendChild(child);
      } else if (child && typeof child === 'object') {
        element.appendChild(document.createTextNode('[Object]'));
      }
    });
    
    return element;
  },
  
  useState: function(initialValue) {
    let currentValue = initialValue;
    const setValue = (newValue) => {
      currentValue = typeof newValue === 'function' ? newValue(currentValue) : newValue;
      setTimeout(() => window.renderApp && window.renderApp(), 10);
    };
    return [() => currentValue, setValue];
  },
  
  useEffect: function(effect, deps) {
    setTimeout(effect, 10);
  },
  
  Fragment: function(props) {
    const fragment = document.createDocumentFragment();
    if (props.children) {
      [].concat(props.children).forEach(child => {
        if (child && child.nodeType) {
          fragment.appendChild(child);
        }
      });
    }
    return fragment;
  }
};
`;
  }

  private static convertToJavaScript(file: GeneratedFile): string {
    let content = file.content;
    
    // Remove imports and exports
    content = content.replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '');
    content = content.replace(/export\s+(default\s+)?/g, '');
    content = content.replace(/export\s*\{[^}]*\}\s*;?\s*/g, '');

    // Convert JSX to React.createElement calls
    content = this.convertJSXToJS(content);
    
    // Handle TypeScript syntax
    content = this.removeTypeScript(content);
    
    return content;
  }

  private static convertJSXToJS(content: string): string {
    // Handle self-closing tags first
    content = content.replace(/<(\w+)([^>]*?)\/>/g, (match, tag, attrs) => {
      const props = this.parseAttributes(attrs);
      return `React.createElement('${tag}', ${props})`;
    });
    
    // Handle opening tags
    content = content.replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
      if (tag.match(/^[A-Z]/)) {
        // Component
        const props = this.parseAttributes(attrs);
        return `React.createElement(${tag}, ${props}, `;
      } else {
        // HTML element
        const props = this.parseAttributes(attrs);
        return `React.createElement('${tag}', ${props}, `;
      }
    });
    
    // Handle closing tags
    content = content.replace(/<\/\w+>/g, ')');
    
    return content;
  }

  private static parseAttributes(attrs: string): string {
    if (!attrs.trim()) return 'null';
    
    const props: string[] = [];
    
    // Match className, style, and other attributes
    attrs.replace(/(\w+)=\{([^}]+)\}/g, (match, name, value) => {
      props.push(`${name}: ${value}`);
      return '';
    });
    
    attrs.replace(/(\w+)="([^"]+)"/g, (match, name, value) => {
      props.push(`${name}: "${value}"`);
      return '';
    });
    
    return props.length > 0 ? `{${props.join(', ')}}` : 'null';
  }

  private static removeTypeScript(content: string): string {
    // Remove type annotations
    content = content.replace(/:\s*[A-Z][a-zA-Z0-9<>[\]|&\s]*(?=[,\)\s=])/g, '');
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
    content = content.replace(/type\s+\w+\s*=[^;]+;/g, '');
    content = content.replace(/<[^>]+>/g, ''); // Remove generic types
    
    return content;
  }

  private static processCSSFiles(files: GeneratedFile[]): string {
    const cssFiles = files.filter(f => f.type === 'css');
    return cssFiles.map(f => f.content).join('\n');
  }

  private static createRenderingLogic(): string {
    return `
window.renderApp = function() {
  const root = document.getElementById('root');
  if (!root) return;
  
  try {
    root.innerHTML = '';
    let appComponent = null;
    
    // Try to find the main app component
    const componentNames = ['App', 'MainApp', 'Application', 'Root'];
    for (const name of componentNames) {
      if (typeof window[name] === 'function') {
        appComponent = window[name];
        break;
      }
    }
    
    if (appComponent) {
      const rendered = appComponent();
      if (rendered && rendered.nodeType) {
        root.appendChild(rendered);
      } else {
        root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>App Rendered Successfully</h2><p>Component loaded but returned non-DOM element</p></div>';
      }
    } else {
      root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui;"><h2>Application Preview</h2><p>App component not found. Available functions: ' + Object.keys(window).filter(k => typeof window[k] === 'function' && k[0] === k[0].toUpperCase()).join(', ') + '</p></div>';
    }
  } catch (error) {
    console.error('Rendering error:', error);
    root.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: system-ui; color: #dc2626;"><h2>Rendering Error</h2><p>' + error.message + '</p><details><summary>Stack trace</summary><pre style="text-align: left; background: #f3f4f6; padding: 1rem; border-radius: 4px; margin-top: 1rem;">' + error.stack + '</pre></details></div>';
  }
};

// Initial render
setTimeout(window.renderApp, 100);
`;
  }

  private static enhanceExistingHTML(html: string, css: string, js: string): string {
    let enhanced = html;
    
    if (css && !enhanced.includes(css)) {
      enhanced = enhanced.replace('</head>', `<style>${css}</style>\n</head>`);
    }
    
    if (js && !enhanced.includes(js)) {
      enhanced = enhanced.replace('</body>', `<script>${js}</script>\n</body>`);
    }
    
    return enhanced;
  }

  private static createHTMLFromScratch(files: GeneratedFile[], css: string, js: string, entryFile: GeneratedFile | null): string {
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
        ${css}
    </style>
</head>
<body>
    <div id="root">
        <div style="padding: 2rem; text-align: center; color: #666;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p>Loading Application...</p>
        </div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    <script>
        console.log('Loading application with ${files.length} files');
        console.log('Entry file:', ${JSON.stringify(entryFile?.path || 'none')});
        ${js}
    </script>
</body>
</html>`;
  }
}
