
import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value?: string;
  code?: string; // For backward compatibility
  onChange: (content: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value,
  code, 
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false 
}) => {
  // Use code prop if value is not provided (backward compatibility)
  const editorValue = value !== undefined ? value : code || '';
  
  return (
    <div className="w-full h-full border border-prism-border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={editorValue}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          readOnly,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          glyphMargin: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
