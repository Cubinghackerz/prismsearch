import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal, Play, Stop, RefreshCw, Server, Globe, Folder, Code, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface EnhancedTerminalProps {
  generatedApp?: GeneratedApp | null;
  isServerRunning: boolean;
  serverPort: number | null;
  onServerStart: (port: number) => void;
  onServerStop: () => void;
}

interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'info';
  timestamp: Date;
}

const EnhancedTerminal: React.FC<EnhancedTerminalProps> = ({
  generatedApp,
  isServerRunning,
  serverPort,
  onServerStart,
  onServerStop
}) => {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      content: 'Welcome to Prism Code Terminal',
      type: 'info',
      timestamp: new Date()
    },
    {
      id: '2',
      content: 'Type commands below or use the quick actions above',
      type: 'info',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/workspace');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const availableCommands = [
    'ls', 'pwd', 'cd', 'mkdir', 'touch', 'cat', 'rm', 'cp', 'mv',
    'npm', 'node', 'python', 'git', 'code', 'serve', 'build',
    'install', 'start', 'dev', 'test', 'help', 'clear'
  ];

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines]);

  const addTerminalLine = (content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date()
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    addTerminalLine(`$ ${command}`, 'command');

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const cmd = command.trim().toLowerCase();
    const args = cmd.split(' ');
    const baseCmd = args[0];

    switch (baseCmd) {
      case 'help':
        addTerminalLine('Available commands:', 'info');
        addTerminalLine('ls, pwd, cd, mkdir, touch, cat, rm, cp, mv', 'output');
        addTerminalLine('npm, node, python, git, code, serve, build', 'output');
        addTerminalLine('install, start, dev, test, clear', 'output');
        break;

      case 'clear':
        setTerminalLines([]);
        break;

      case 'ls':
        if (generatedApp) {
          addTerminalLine('index.html  styles.css  script.js  package.json', 'output');
        } else {
          addTerminalLine('No files generated yet. Use the generator to create an app.', 'info');
        }
        break;

      case 'pwd':
        addTerminalLine(currentDirectory, 'output');
        break;

      case 'cat':
        if (args.length < 2) {
          addTerminalLine('Usage: cat <filename>', 'error');
        } else if (generatedApp) {
          const filename = args[1];
          if (filename === 'index.html') {
            addTerminalLine(generatedApp.html.substring(0, 500) + '...', 'output');
          } else if (filename === 'styles.css') {
            addTerminalLine(generatedApp.css.substring(0, 300) + '...', 'output');
          } else if (filename === 'script.js') {
            addTerminalLine(generatedApp.javascript.substring(0, 300) + '...', 'output');
          } else {
            addTerminalLine(`cat: ${filename}: No such file or directory`, 'error');
          }
        } else {
          addTerminalLine('No files available. Generate an app first.', 'error');
        }
        break;

      case 'npm':
        if (args[1] === 'install') {
          addTerminalLine('📦 Installing dependencies...', 'info');
          setTimeout(() => {
            addTerminalLine('✅ Dependencies installed successfully', 'output');
            addTerminalLine('Added 147 packages in 3.2s', 'output');
          }, 1500);
        } else if (args[1] === 'start' || args[1] === 'dev') {
          startDevServer();
        } else {
          addTerminalLine('Available npm commands: install, start, dev, build', 'info');
        }
        break;

      case 'serve':
      case 'start':
      case 'dev':
        startDevServer();
        break;

      case 'build':
        addTerminalLine('🔨 Building application...', 'info');
        setTimeout(() => {
          addTerminalLine('✅ Build completed successfully', 'output');
          addTerminalLine('Output saved to ./dist/', 'output');
        }, 2000);
        break;

      case 'node':
        if (args.length < 2) {
          addTerminalLine('Node.js v18.17.0', 'output');
          addTerminalLine('Usage: node <filename>', 'info');
        } else {
          addTerminalLine(`Executing ${args[1]}...`, 'info');
          setTimeout(() => {
            addTerminalLine('Script executed successfully', 'output');
          }, 1000);
        }
        break;

      case 'python':
        if (args.length < 2) {
          addTerminalLine('Python 3.11.5', 'output');
          addTerminalLine('Usage: python <filename>', 'info');
        } else {
          addTerminalLine(`Running ${args[1]}...`, 'info');
          setTimeout(() => {
            addTerminalLine('Python script completed', 'output');
          }, 1000);
        }
        break;

      case 'git':
        if (args[1] === 'status') {
          addTerminalLine('On branch main', 'output');
          addTerminalLine('Your branch is up to date with origin/main', 'output');
          addTerminalLine('nothing to commit, working tree clean', 'output');
        } else if (args[1] === 'init') {
          addTerminalLine('Initialized empty Git repository', 'output');
        } else {
          addTerminalLine('Git commands: status, init, add, commit, push, pull', 'info');
        }
        break;

      case 'code':
        addTerminalLine('Opening VS Code interface...', 'info');
        setTimeout(() => {
          addTerminalLine('✅ VS Code interface ready', 'output');
        }, 1000);
        break;

      default:
        addTerminalLine(`Command not found: ${baseCmd}`, 'error');
        addTerminalLine('Type "help" for available commands', 'info');
    }

    setIsExecuting(false);
  };

  const startDevServer = () => {
    if (isServerRunning) {
      addTerminalLine('Development server is already running', 'info');
      return;
    }

    if (!generatedApp) {
      addTerminalLine('No app to serve. Generate an app first.', 'error');
      return;
    }

    const port = 3000 + Math.floor(Math.random() * 1000);
    addTerminalLine('🚀 Starting development server...', 'info');
    
    setTimeout(() => {
      addTerminalLine(`✅ Server running at http://localhost:${port}`, 'output');
      addTerminalLine('Ready for development!', 'info');
      onServerStart(port);
      toast({
        title: "Development server started",
        description: `Your app is running on port ${port}`,
      });
    }, 2000);
  };

  const stopDevServer = () => {
    if (!isServerRunning) {
      addTerminalLine('No server is currently running', 'info');
      return;
    }

    addTerminalLine('🛑 Stopping development server...', 'info');
    setTimeout(() => {
      addTerminalLine('✅ Server stopped', 'output');
      onServerStop();
      toast({
        title: "Development server stopped",
        description: "The local server has been terminated",
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const matches = availableCommands.filter(cmd => 
        cmd.startsWith(currentCommand.toLowerCase())
      );
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    }
  };

  const clearTerminal = () => {
    setTerminalLines([]);
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-yellow-400';
      case 'output': return 'text-green-400';
      default: return 'text-prism-text';
    }
  };

  return (
    <Card className="h-full flex flex-col bg-black/95 border-prism-border">
      <CardHeader className="pb-3 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="text-prism-text">Enhanced Terminal</span>
            {isServerRunning && (
              <Badge className="bg-green-600 text-white">
                <Server className="w-3 h-3 mr-1" />
                Live: {serverPort}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {generatedApp && (
              <>
                {!isServerRunning ? (
                  <Button
                    onClick={startDevServer}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start Server
                  </Button>
                ) : (
                  <Button
                    onClick={stopDevServer}
                    size="sm"
                    variant="destructive"
                  >
                    <Stop className="w-3 h-3 mr-1" />
                    Stop Server
                  </Button>
                )}
                {isServerRunning && (
                  <Button
                    onClick={() => window.open(`http://localhost:${serverPort}`, '_blank')}
                    size="sm"
                    variant="outline"
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                )}
              </>
            )}
            <Button
              onClick={clearTerminal}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 bg-black font-mono text-sm overflow-y-auto max-h-[500px]"
        >
          {terminalLines.map((line) => (
            <div key={line.id} className={`mb-1 ${getLineColor(line.type)}`}>
              <span className="select-text">{line.content}</span>
            </div>
          ))}
          
          {/* Command Input Line */}
          <div className="flex items-center text-green-400 mt-2">
            <span className="mr-2">prism@code:{currentDirectory}$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent border-none outline-none text-white"
              placeholder="Enter command..."
              disabled={isExecuting}
              autoFocus
            />
            {isExecuting && (
              <div className="ml-2 w-2 h-4 bg-green-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-gray-800 p-3 bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Directory: {currentDirectory}</span>
              {generatedApp && (
                <span className="flex items-center">
                  <Folder className="w-3 h-3 mr-1" />
                  3 files
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Terminal v1.0</span>
              {isServerRunning && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                  <span>Server Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTerminal;