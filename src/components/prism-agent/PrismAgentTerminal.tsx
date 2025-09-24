import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PrismAgentVersion } from '@/context/PrismAgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrismAgentRuntime, type RuntimeKind } from '@/context/PrismAgentRuntimeContext';
import { Loader2, PlugZap, RefreshCw, Terminal as TerminalIcon } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface PrismAgentTerminalProps {
  activeVersion?: PrismAgentVersion;
}

type XTerm = import('@xterm/xterm').Terminal;
type FitAddonType = import('@xterm/addon-fit').FitAddon;

const PrismAgentTerminal = ({ activeVersion }: PrismAgentTerminalProps) => {
  const {
    runtime,
    setRuntime,
    statusMessage,
    isBooting,
    isSyncing,
    syncWorkspace,
    runCommand,
    subscribeToLogs,
    runtimeReady,
  } = usePrismAgentRuntime();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddonType | null>(null);
  const commandBufferRef = useRef<string>('');
  const logUnsubscribeRef = useRef<(() => void) | null>(null);
  const promptPendingRef = useRef(false);

  const activeApp = activeVersion?.app;

  const promptLabel = useMemo(
    () => (runtime === 'node' ? 'node:~/workspace$ ' : 'python:~/workspace$ '),
    [runtime]
  );

  const write = useCallback((message: string) => {
    if (!termRef.current) return;
    termRef.current.write(message);
  }, []);

  const showPrompt = useCallback(() => {
    if (!termRef.current) return;
    if (!promptPendingRef.current) {
      termRef.current.write(`\r\n${promptLabel}`);
    } else {
      termRef.current.write(promptLabel);
    }
    promptPendingRef.current = false;
    commandBufferRef.current = '';
  }, [promptLabel]);

  const handleResize = useCallback(() => {
    try {
      fitAddonRef.current?.fit();
    } catch (error) {
      // Ignore resize errors
    }
  }, []);

  const handleCommand = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) {
        showPrompt();
        return;
      }

      if (runtime === 'python' && trimmed === 'clear') {
        termRef.current?.clear();
        promptPendingRef.current = true;
      }

      try {
        await runCommand(command);
      } catch (error) {
        write(`\r\n# Failed to run command: ${error instanceof Error ? error.message : String(error)}\r\n`);
      } finally {
        if (runtime !== 'node') {
          showPrompt();
        } else {
          // For Node commands we wait for completion before re-displaying the prompt
          showPrompt();
        }
      }
    },
    [runCommand, runtime, showPrompt, write]
  );

  const initTerminal = useCallback(async () => {
    if (termRef.current) {
      return;
    }

    const [{ Terminal }, { FitAddon }, { WebLinksAddon }] = await Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
      import('@xterm/addon-web-links'),
    ]);

    const terminal = new Terminal({
      theme: {
        background: '#050505',
        foreground: '#f8fafc',
        cursor: '#38bdf8',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      cursorBlink: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    termRef.current = terminal;
    fitAddonRef.current = fitAddon;

    if (containerRef.current) {
      terminal.open(containerRef.current);
      fitAddon.fit();
    }

    terminal.writeln('Prism Agent runtime terminal ready.');
    terminal.writeln('Install dependencies, run build tools, and host previews directly inside the sandbox.');
    terminal.write(promptLabel);
    commandBufferRef.current = '';

    terminal.onData((data: string) => {
      const code = data.charCodeAt(0);

      if (code === 13) {
        const commandValue = commandBufferRef.current;
        terminal.write('\r\n');
        commandBufferRef.current = '';
        void handleCommand(commandValue);
        return;
      }

      if (code === 127) {
        if (commandBufferRef.current.length > 0) {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
          terminal.write('\b \b');
        }
        return;
      }

      if (code === 3) {
        terminal.writeln('^C');
        showPrompt();
        return;
      }

      commandBufferRef.current += data;
      terminal.write(data);
    });

    window.addEventListener('resize', handleResize);

    logUnsubscribeRef.current = subscribeToLogs((message) => {
      write(message);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      logUnsubscribeRef.current?.();
      terminal.dispose();
      termRef.current = null;
    };
  }, [handleCommand, handleResize, promptLabel, subscribeToLogs, write]);

  const syncActiveWorkspace = useCallback(async () => {
    if (!activeApp) {
      return;
    }
    await syncWorkspace(activeApp);
  }, [activeApp, syncWorkspace]);

  useEffect(() => {
    let dispose: (() => void) | void;
    initTerminal().then((cleanup) => {
      dispose = cleanup;
    });

    return () => {
      dispose?.();
    };
  }, [initTerminal]);

  useEffect(() => {
    if (!runtimeReady || !activeApp) return;
    void syncWorkspace(activeApp);
  }, [activeApp, runtimeReady, runtime, syncWorkspace]);

  useEffect(() => {
    write(`\r\n# Switched runtime to ${runtime}.\r\n`);
    promptPendingRef.current = true;
    showPrompt();
  }, [runtime, showPrompt, write]);

  useEffect(() => {
    return () => {
      logUnsubscribeRef.current?.();
    };
  }, []);

  return (
    <Card className="border border-border/40 bg-background/70 backdrop-blur">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TerminalIcon className="h-4 w-4 text-primary" /> Runtime terminal
          </CardTitle>
          {activeApp && (
            <div className="flex items-center gap-2">
              <Select
                value={runtime}
                onValueChange={(value) => setRuntime(value as RuntimeKind)}
                disabled={isBooting || isSyncing}
              >
                <SelectTrigger className="h-8 w-[220px] text-xs">
                  <SelectValue placeholder="Select runtime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="node">Node.js (WebContainer)</SelectItem>
                  <SelectItem value="python">Python (Pyodide)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={syncActiveWorkspace}
                disabled={isBooting || isSyncing}
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync files
              </Button>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Install dependencies, run dev servers, and preview projects directly inside Prism Agent for any supported stack.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeApp ? (
          <div className="rounded-lg border border-dashed border-border/40 bg-background/40 p-6 text-center text-sm text-muted-foreground">
            Generate a build to access the runtime terminal and environment syncing tools.
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border/30 bg-black/80 p-3">
              <div ref={containerRef} className="h-64" />
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <PlugZap className="h-4 w-4 text-primary" />
                <span>{statusMessage}</span>
              </div>
              {isBooting && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  Booting runtime...
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PrismAgentTerminal;
