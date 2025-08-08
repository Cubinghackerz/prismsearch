
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (code: string) => void;
}

const CodeEditor = ({ language, code, onChange }: CodeEditorProps) => {
  const getLanguageComment = (lang: string) => {
    switch (lang) {
      case 'python':
        return '# Write your Python code here\n# Use input("prompt: ") to get user input\n# Example: name = input("Enter your name: ")';
      case 'javascript':
        return '// Write your JavaScript code here\n// Use prompt("message") to get user input';
      case 'typescript':
        return '// Write your TypeScript code here (Beta)';
      case 'html':
        return '<!-- Write your HTML code here (Beta) -->';
      case 'css':
        return '/* Write your CSS code here (Beta) */';
      case 'json':
        return '// Write your JSON here (Beta)';
      default:
        return '// Write your code here';
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getLanguageComment(language)}
        className="min-h-[200px] font-mono text-sm resize-none border-0 bg-prism-surface/10 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{
          fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
          tabSize: 2,
        }}
        onKeyDown={(e) => {
          // Handle tab key for indentation
          if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;
            const newValue = value.substring(0, start) + '  ' + value.substring(end);
            onChange(newValue);
            // Set cursor position after the inserted spaces
            setTimeout(() => {
              target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
          }
        }}
      />
      <div className="absolute top-2 right-2">
        <span className="text-xs text-prism-text-muted bg-prism-surface/50 px-2 py-1 rounded">
          {language}
        </span>
      </div>
    </div>
  );
};

export default CodeEditor;
