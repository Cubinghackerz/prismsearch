import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, Trash2, Info, AlertTriangle, CheckCircle, Command } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { format } from 'date-fns';

const LogsPanel: React.FC = () => {
  const { logs, addLog } = useWorkspace();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    // We can't dispatch directly, so we'll add a special log that triggers clearing
    addLog('--- Logs cleared ---', 'info');
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'command': return <Command className="w-3 h-3 text-cyan-400" />;
      default: return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'command': return 'text-cyan-400';
      default: return 'text-muted-foreground';
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center py-12">
          <Terminal className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Logs Yet</h3>
          <p className="text-muted-foreground">
            Command output and system logs will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="w-5 h-5" />
            <span>Logs</span>
            <Badge variant="secondary">
              {logs.length}
            </Badge>
          </CardTitle>
          <Button onClick={clearLogs} size="sm" variant="outline">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-2 font-mono text-sm">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50"
              >
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {getLogIcon(log.type)}
                  <span className="text-xs text-muted-foreground">
                    {format(log.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
                <div className={`flex-1 ${getLogColor(log.type)}`}>
                  <pre className="whitespace-pre-wrap break-words">{log.message}</pre>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsPanel;