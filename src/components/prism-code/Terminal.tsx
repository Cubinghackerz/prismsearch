
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon, Play, X, Folder } from 'lucide-react';

interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

interface TerminalProps {
  projectPath?: string;
  onPackageInstall?: (packageName: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ projectPath = '/project', onPackageInstall }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsExecuting(true);
    const commandId = `cmd-${Date.now()}`;
    
    // Add command to history
    const newEntry: TerminalOutput = {
      id: commandId,
      command: cmd,
      output: '',
      timestamp: new Date(),
      type: 'info'
    };

    setHistory(prev => [...prev, newEntry]);

    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let output = '';
      let type: 'success' | 'error' | 'info' = 'success';

      // Handle different commands
      if (cmd.startsWith('npm install') || cmd.startsWith('yarn add')) {
        const packageName = cmd.split(' ').slice(-1)[0];
        output = `+ ${packageName}@latest\npackage installed successfully`;
        onPackageInstall?.(packageName);
      } else if (cmd === 'npm init' || cmd === 'yarn init') {
        output = 'package.json created successfully';
      } else if (cmd === 'ls' || cmd === 'dir') {
        output = 'index.html\nstyles.css\nscript.js\npackage.json\nnode_modules/';
      } else if (cmd === 'pwd') {
        output = projectPath;
      } else if (cmd.startsWith('cd ')) {
        output = `changed directory to ${cmd.split(' ')[1]}`;
      } else if (cmd === 'npm run build' || cmd === 'yarn build') {
        output = 'Build completed successfully!\nOutput generated in /dist';
      } else if (cmd === 'npm start' || cmd === 'yarn start') {
        output = 'Development server started on http://localhost:3000';
      } else if (cmd === 'clear') {
        setHistory([]);
        setCommand('');
        setIsExecuting(false);
        return;
      } else if (cmd === 'help') {
        output = `Available commands:
npm install <package> - Install a package
npm init - Initialize package.json
npm run build - Build the project
npm start - Start development server
ls/dir - List files
pwd - Show current directory
cd <dir> - Change directory
clear - Clear terminal
help - Show this help`;
      } else {
        output = `Command not found: ${cmd}`;
        type = 'error';
      }

      // Update the entry with output
      setHistory(prev => prev.map(entry => 
        entry.id === commandId 
          ? { ...entry, output, type }
          : entry
      ));
    } catch (error) {
      setHistory(prev => prev.map(entry => 
        entry.id === commandId 
          ? { ...entry, output: `Error: ${error}`, type: 'error' }
          : entry
      ));
    } finally {
      setIsExecuting(false);
      setCommand('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(command);
    }
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  return (
    <Card className="h-full flex flex-col bg-gray-900 text-green-400 font-mono">
      <CardHeader className="pb-3 bg-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg text-green-400">
            <TerminalIcon className="w-5 h-5" />
            <span>Terminal</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-400">
              <Folder className="w-4 h-4 mr-1" />
              <span>{projectPath}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearTerminal}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-gray-900">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">$</span>
                  <span className="text-white">{entry.command}</span>
                </div>
                {entry.output && (
                  <div className={`pl-4 whitespace-pre-wrap text-sm ${
                    entry.type === 'error' ? 'text-red-400' : 
                    entry.type === 'success' ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {entry.output}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">$</span>
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0"
              disabled={isExecuting}
            />
            <Button
              size="sm"
              onClick={() => executeCommand(command)}
              disabled={isExecuting || !command.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Terminal;
