
import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (content: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  code?: string; // Add support for 'code' prop as alias for 'value'
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  code,
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false 
}) => {
  // Use 'code' prop if provided, otherwise use 'value'
  const content = code || value;
  
  return (
    <div className="w-full h-full border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={content}
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
