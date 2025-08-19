
import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (content: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '400px',
  readOnly = false 
}) => {
  return (
    <div className="w-full h-full border border-prism-border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
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
