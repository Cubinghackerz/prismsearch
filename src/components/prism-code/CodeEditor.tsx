
import React from 'react';
import Editor from '@monaco-editor/react';

export interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  className = "",
  height = "400px",
  readOnly = false
}) => {
  return (
    <div className={`border border-prism-border rounded-lg overflow-hidden ${className}`}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
