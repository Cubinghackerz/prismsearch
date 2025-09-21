import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Code, FileText, Palette, Settings, Play, Save, FolderOpen, 
  Search, GitBranch, Bug, Extensions, MoreHorizontal, Maximize2,
  Terminal, Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface VSCodeInterfaceProps {
  generatedApp: GeneratedApp;
  onFileChange?: (fileType: string, content: string) => void;
  activeLanguage: string;
  onLanguageChange?: (language: string) => void;
}

interface FileTab {
  key: string;
  name: string;
  language: string;
  content: string;
  modified: boolean;
  icon: React.ReactNode;
}

const VSCodeInterface: React.FC<VSCodeInterfaceProps> = ({
  generatedApp,
  onFileChange,
  activeLanguage,
  onLanguageChange
}) => {
  const [activeFile, setActiveFile] = useState('index.html');
  const [theme, setTheme] = useState('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openTabs, setOpenTabs] = useState<FileTab[]>([
    {
      key: 'index.html',
      name: 'index.html',
      language: 'html',
      content: generatedApp.html,
      modified: false,
      icon: <FileText className="w-3 h-3" />
    },
    {
      key: 'styles.css',
      name: 'styles.css', 
      language: 'css',
      content: generatedApp.css,
      modified: false,
      icon: <Palette className="w-3 h-3" />
    },
    {
      key: 'script.js',
      name: 'script.js',
      language: 'javascript',
      content: generatedApp.javascript,
      modified: false,
      icon: <Code className="w-3 h-3" />
    }
  ]);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  const supportedLanguages = [
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'rust', name: 'Rust', ext: '.rs' },
    { id: 'go', name: 'Go', ext: '.go' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'html', name: 'HTML', ext: '.html' },
    { id: 'css', name: 'CSS', ext: '.css' },
    { id: 'json', name: 'JSON', ext: '.json' }
  ];

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Monaco Editor with VS Code-like settings
    monaco.editor.defineTheme('prism-vscode', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorCursor.foreground': '#AEAFAD',
        'editor.findMatchBackground': '#515C6A',
        'editor.findMatchHighlightBackground': '#EA5C004D',
      }
    });

    monaco.editor.setTheme('prism-vscode');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && onFileChange) {
      // Mark file as modified
      setOpenTabs(prev => prev.map(tab => 
        tab.key === activeFile 
          ? { ...tab, content: value, modified: true }
          : tab
      ));

      // Map file keys to the expected format
      const fileTypeMap: { [key: string]: string } = {
        'index.html': 'html',
        'styles.css': 'css',
        'script.js': 'javascript'
      };

      const fileType = fileTypeMap[activeFile];
      if (fileType) {
        onFileChange(fileType, value);
      }
    }
  };

  const saveFile = () => {
    setOpenTabs(prev => prev.map(tab => 
      tab.key === activeFile 
        ? { ...tab, modified: false }
        : tab
    ));
    
    toast({
      title: "File saved",
      description: `${activeFile} has been saved successfully.`,
    });
  };

  const createNewFile = () => {
    const language = supportedLanguages.find(lang => lang.id === activeLanguage);
    if (!language) return;

    const fileName = `untitled${language.ext}`;
    const newTab: FileTab = {
      key: fileName,
      name: fileName,
      language: activeLanguage,
      content: `// New ${language.name} file\n`,
      modified: true,
      icon: <Code className="w-3 h-3" />
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveFile(fileName);
  };

  const runCode = () => {
    const currentTab = openTabs.find(tab => tab.key === activeFile);
    if (!currentTab) return;

    toast({
      title: "Code executed",
      description: `Running ${currentTab.name} in ${currentTab.language} environment`,
    });
  };

  const activeTab = openTabs.find(tab => tab.key === activeFile);

  return (
    <Card className="h-full flex flex-col bg-gray-900 border-gray-700">
      <CardHeader className="pb-2 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Code className="w-5 h-5 text-blue-400" />
            <span className="text-white">VS Code Interface</span>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              Beta
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={activeLanguage} onValueChange={(value) => onLanguageChange?.(value)}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createNewFile} size="sm" variant="outline">
              <FileText className="w-3 h-3 mr-1" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* VS Code-like interface */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <div 
            className="bg-gray-800 border-r border-gray-700 flex flex-col"
            style={{ width: `${sidebarWidth}px` }}
          >
            {/* Activity Bar */}
            <div className="bg-gray-900 w-12 flex flex-col items-center py-4 space-y-4 border-r border-gray-700">
              <FolderOpen className="w-5 h-5 text-white cursor-pointer hover:text-blue-400" />
              <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-400" />
              <GitBranch className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-400" />
              <Bug className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-400" />
              <Extensions className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-400" />
            </div>

            {/* File Explorer */}
            <div className="flex-1 p-3">
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Explorer</h3>
              <div className="space-y-1">
                {openTabs.map((tab) => (
                  <div
                    key={tab.key}
                    onClick={() => setActiveFile(tab.key)}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      activeFile === tab.key 
                        ? 'bg-blue-600/30 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.name}</span>
                    {tab.modified && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            <div className="bg-gray-800 border-b border-gray-700 flex">
              {openTabs.map((tab) => (
                <div
                  key={tab.key}
                  onClick={() => setActiveFile(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-700 cursor-pointer transition-colors ${
                    activeFile === tab.key 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm">{tab.name}</span>
                  {tab.modified && (
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Editor */}
            <div className="flex-1">
              <Editor
                height="400px"
                language={activeTab?.language || 'javascript'}
                value={activeTab?.content || ''}
                theme="prism-vscode"
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  glyphMargin: true,
                  folding: true,
                  showFoldingControls: 'always',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true
                  }
                }}
              />
            </div>

            {/* Status Bar */}
            <div className="bg-blue-600 h-6 flex items-center justify-between px-4 text-white text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <GitBranch className="w-3 h-3" />
                  <span>main</span>
                </div>
                <span>UTF-8</span>
                <span>{activeTab?.language.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Ln 1, Col 1</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Prism Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-gray-700 p-3 bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button onClick={saveFile} size="sm" variant="outline">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button onClick={runCode} size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="vs-light">Light</SelectItem>
                <SelectItem value="hc-black">High Contrast</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsFullscreen(!isFullscreen)} size="sm" variant="outline">
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VSCodeInterface;