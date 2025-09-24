import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import { GeneratedApp } from '@/services/codeGenerationService';
import {
  NODE_WORKSPACE_DIR,
  PYTHON_PREVIEW_FILE,
  buildFileEntries,
  buildFileTree,
  inferRuntimeKind,
} from '@/components/prism-agent/runtimeUtils';

export type RuntimeKind = 'node' | 'python';

type WebContainerInstance = import('@webcontainer/api').WebContainer;
type WebContainerProcess = import('@webcontainer/api').WebContainerProcess;

type PyodideFileSystem = {
  stat: (path: string) => { mode: number } | undefined;
  isDir: (mode: number) => boolean;
  readdir: (path: string) => string[];
  mkdir: (path: string) => void;
  unlink: (path: string) => void;
  rmdir: (path: string) => void;
  writeFile: (path: string, content: string) => void;
  readFile: (path: string, options: { encoding: 'utf8' }) => string;
};

type PyodideInstance = {
  FS: PyodideFileSystem;
  loadPackage: (name: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
};

type LogListener = (message: string) => void;

interface PrismAgentRuntimeContextValue {
  runtime: RuntimeKind;
  setRuntime: (runtime: RuntimeKind) => void;
  statusMessage: string;
  isBooting: boolean;
  isSyncing: boolean;
  isStartingPreview: boolean;
  previewUrl: string | null;
  pythonPreviewHtml: string | null;
  previewRuntime: RuntimeKind | null;
  runtimeReady: boolean;
  syncWorkspace: (app: GeneratedApp) => Promise<void>;
  runCommand: (command: string) => Promise<void>;
  startPreview: (app: GeneratedApp) => Promise<void>;
  stopPreview: () => Promise<void>;
  restartPreview: (app: GeneratedApp) => Promise<void>;
  subscribeToLogs: (listener: LogListener) => () => void;
}

const PrismAgentRuntimeContext = createContext<PrismAgentRuntimeContextValue | undefined>(undefined);

interface PrismAgentRuntimeProviderProps {
  children: ReactNode;
  app?: GeneratedApp;
}

const PYTHON_DEFAULT_PREVIEW = 'https://pyodide-http.local:5000/';

export const PrismAgentRuntimeProvider = ({ children, app }: PrismAgentRuntimeProviderProps) => {
  const { toast } = useToast();
  const [runtime, setRuntimeState] = useState<RuntimeKind>(() => inferRuntimeKind(app));
  const [statusMessage, setStatusMessage] = useState('Select a runtime and sync your project files to begin.');
  const [isBooting, setIsBooting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStartingPreview, setIsStartingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewRuntime, setPreviewRuntime] = useState<RuntimeKind | null>(null);
  const [pythonPreviewHtml, setPythonPreviewHtml] = useState<string | null>(null);
  const [runtimeReady, setRuntimeReady] = useState(false);

  const nodeContainerRef = useRef<WebContainerInstance | null>(null);
  const activeProcessRef = useRef<WebContainerProcess | null>(null);
  const pythonRuntimeRef = useRef<PyodideInstance | null>(null);
  const pythonPatchedRef = useRef(false);
  const pythonPendingCommandRef = useRef<Promise<unknown> | null>(null);
  const logListenersRef = useRef(new Set<LogListener>());
  const decoderRef = useRef(new TextDecoder());

  useEffect(() => {
    if (!app) return;
    setRuntimeState((current) => {
      const inferred = inferRuntimeKind(app);
      return current === inferred ? current : inferred;
    });
  }, [app]);

  const appendLog = useCallback((message: string) => {
    logListenersRef.current.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.warn('Failed to notify Prism Agent runtime listener', error);
      }
    });
  }, []);

  const subscribeToLogs = useCallback((listener: LogListener) => {
    logListenersRef.current.add(listener);
    return () => {
      logListenersRef.current.delete(listener);
    };
  }, []);

  const setRuntime = useCallback((next: RuntimeKind) => {
    setRuntimeState(next);
    setPreviewUrl(null);
    setPreviewRuntime(null);
    setRuntimeReady(false);
    setStatusMessage(next === 'node' ? 'WebContainer runtime selected.' : 'Python runtime selected.');
  }, []);

  const clearPythonDirectory = useCallback((FS: PyodideFileSystem, path: string) => {
    try {
      const stats = FS.stat(path);
      if (!stats) return;
      if (FS.isDir(stats.mode)) {
        FS.readdir(path)
          .filter((entry) => entry !== '.' && entry !== '..')
          .forEach((entry) => {
            const childPath = `${path}/${entry}`;
            const childStats = FS.stat(childPath);
            if (childStats && FS.isDir(childStats.mode)) {
              clearPythonDirectory(FS, childPath);
              FS.rmdir(childPath);
            } else {
              FS.unlink(childPath);
            }
          });
      } else {
        FS.unlink(path);
      }
    } catch (error) {
      console.warn('Failed to clear Pyodide directory', error);
    }
  }, []);

  const ensurePythonDirectory = useCallback((FS: PyodideFileSystem, dir: string) => {
    const parts = dir.split('/').filter(Boolean);
    let current = '';
    parts.forEach((part) => {
      current = `${current}/${part}`;
      try {
        FS.mkdir(current);
      } catch (error) {
        // Directory may already exist
      }
    });
  }, []);

  const ensureNodeContainer = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    if (nodeContainerRef.current) return nodeContainerRef.current;

    setIsBooting(true);
    setStatusMessage('Booting WebContainer runtime...');

    try {
      const { WebContainer } = await import('@webcontainer/api');
      const container = await WebContainer.boot();

      container.on('server-ready', (_port, url) => {
        setPreviewUrl(url);
        setPreviewRuntime('node');
        setPythonPreviewHtml(null);
        appendLog(`\r\n# Server ready at ${url}\r\n`);
      });

      container.on('server-crash', (error) => {
        appendLog(`\r\n# Server crashed: ${String(error)}\r\n`);
        setStatusMessage('Server crashed. Check logs or restart preview.');
      });

      nodeContainerRef.current = container;
      setRuntimeReady(true);
      setStatusMessage('WebContainer ready. Sync files to begin.');
      return container;
    } catch (error) {
      console.error('Failed to boot WebContainer', error);
      toast({
        title: 'WebContainer failed to start',
        description: 'Unable to launch the Node.js sandbox. Review runtime instructions to run locally.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsBooting(false);
    }
  }, [appendLog, toast]);

  const ensurePythonRuntime = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    if (pythonRuntimeRef.current) return pythonRuntimeRef.current;

    setIsBooting(true);
    setStatusMessage('Loading Pyodide runtime...');

    try {
      if (!(window as Window & { loadPyodide?: (config?: Record<string, unknown>) => Promise<unknown> }).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide script'));
          document.body.appendChild(script);
        });
      }

      const loader = (window as Window & { loadPyodide: (config?: Record<string, unknown>) => Promise<unknown> }).loadPyodide;
      const pyodide = (await loader({
        stdout: (text: string) => appendLog(text),
        stderr: (text: string) => appendLog(text),
      })) as PyodideInstance;

      await pyodide.loadPackage('micropip');
      pythonRuntimeRef.current = pyodide;
      setRuntimeReady(true);
      setStatusMessage('Python runtime ready. Sync files to begin.');
      return pyodide;
    } catch (error) {
      console.error('Failed to boot Pyodide', error);
      toast({
        title: 'Python runtime failed to load',
        description: 'Unable to start the in-browser Python runtime. Review runtime instructions to run locally.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsBooting(false);
    }
  }, [appendLog, toast]);

  const patchPythonNetworking = useCallback(async (pyodide: PyodideInstance) => {
    if (pythonPatchedRef.current) return;

    try {
      await pyodide.runPythonAsync(
        `import micropip\n` +
          `try:\n` +
          `    await micropip.install('pyodide-http==0.2.1')\n` +
          `except Exception:\n` +
          `    pass\n` +
          `import pyodide_http\n` +
          `pyodide_http.patch_all()\n`
      );
      pythonPatchedRef.current = true;
      appendLog('\r\n# Python HTTP support enabled via pyodide-http.\r\n');
    } catch (error) {
      console.error('Failed to patch Python networking', error);
      appendLog('\r\n# Failed to enable pyodide-http networking support.\r\n');
    }
  }, [appendLog]);

  const updatePythonPreview = useCallback(() => {
    if (!pythonRuntimeRef.current) {
      setPythonPreviewHtml(null);
      return;
    }

    try {
      const html = pythonRuntimeRef.current.FS.readFile(PYTHON_PREVIEW_FILE, { encoding: 'utf8' });
      setPythonPreviewHtml(html);
    } catch (error) {
      setPythonPreviewHtml(null);
    }
  }, []);

  const syncWorkspace = useCallback(
    async (targetApp: GeneratedApp) => {
      if (runtime === 'node') {
        const container = await ensureNodeContainer();
        if (!container) return;

        setIsSyncing(true);
        setStatusMessage('Syncing project files into WebContainer...');

        try {
          const files = buildFileEntries(targetApp);
          const tree = buildFileTree(files);

          await container.mount({
            workspace: {
              directory: tree,
            },
          });

          appendLog(`\r\n# Synced ${files.length} file${files.length === 1 ? '' : 's'} into ${NODE_WORKSPACE_DIR}\r\n`);
          setStatusMessage('Workspace synced. Install dependencies or start the preview to run your backend.');
        } catch (error) {
          console.error('Failed to sync WebContainer workspace', error);
          toast({
            title: 'Failed to sync workspace',
            description: 'Could not copy files into the WebContainer runtime.',
            variant: 'destructive',
          });
        } finally {
          setIsSyncing(false);
        }
        return;
      }

      const pyodide = await ensurePythonRuntime();
      if (!pyodide) return;

      setIsSyncing(true);
      setStatusMessage('Syncing project files into Pyodide...');

      try {
        const { FS } = pyodide;
        ensurePythonDirectory(FS, NODE_WORKSPACE_DIR);
        clearPythonDirectory(FS, NODE_WORKSPACE_DIR);

        const files = buildFileEntries(targetApp);

        files.forEach(({ path, content }) => {
          const cleanPath = path.replace(/^\/+/, '');
          const fullPath = `${NODE_WORKSPACE_DIR}/${cleanPath}`;
          const directory = fullPath.split('/').slice(0, -1).join('/');
          ensurePythonDirectory(FS, directory);
          FS.writeFile(fullPath, content);
        });

        appendLog(`\r\n# Synced ${files.length} file${files.length === 1 ? '' : 's'} into ${NODE_WORKSPACE_DIR}\r\n`);
        setStatusMessage('Workspace synced. Install dependencies or start the preview to run your backend.');
        updatePythonPreview();
      } catch (error) {
        console.error('Failed to sync Pyodide workspace', error);
        toast({
          title: 'Failed to sync Python workspace',
          description: 'Unable to copy files into the Pyodide runtime.',
          variant: 'destructive',
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [appendLog, clearPythonDirectory, ensureNodeContainer, ensurePythonDirectory, ensurePythonRuntime, runtime, toast, updatePythonPreview]
  );

  const runNodeCommand = useCallback(
    async (command: string, options?: { background?: boolean }) => {
      const container = await ensureNodeContainer();
      if (!container) return;

      const trimmed = command.trim();
      if (!trimmed) return;

      setStatusMessage(`Running: ${trimmed}`);
      appendLog(`\r\n$ ${trimmed}\r\n`);

      const shell = await container.spawn('bash', {
        args: ['-lc', `cd ${NODE_WORKSPACE_DIR} && ${trimmed}`],
      });

      const reader = shell.output.getReader();

      const pumpOutput = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            appendLog(decoderRef.current.decode(value));
          }
        }
      };

      const outputPromise = pumpOutput();

      if (options?.background) {
        activeProcessRef.current = shell;
        shell.exit.then((code) => {
          appendLog(`\r\n# Process exited with code ${code}\r\n`);
          if (activeProcessRef.current === shell) {
            activeProcessRef.current = null;
          }
          setStatusMessage('Process exited.');
        });
        outputPromise.catch((error) => console.warn('Background command output error', error));
        return;
      }

      const exitCode = await shell.exit;
      await outputPromise;

      if (exitCode !== 0) {
        appendLog(`\r\n# Process exited with code ${exitCode}\r\n`);
      }

      setStatusMessage('WebContainer runtime ready.');
    },
    [appendLog, ensureNodeContainer]
  );

  const runPythonCommand = useCallback(
    async (command: string) => {
      const pyodide = await ensurePythonRuntime();
      if (!pyodide) return;

      const trimmed = command.trim();
      if (!trimmed) return;

      setStatusMessage(`Running: ${trimmed}`);
      appendLog(`\r\n$ ${trimmed}\r\n`);

      if (trimmed === 'clear') {
        setStatusMessage('Cleared terminal output.');
        return;
      }

      const runCommandAsync = async () => {
        if (trimmed.startsWith('pip install -r')) {
          const file = trimmed.replace('pip install -r', '').trim();
          const path = file.startsWith('/') ? file : `${NODE_WORKSPACE_DIR}/${file}`;
          try {
            await pyodide.runPythonAsync(
              `import asyncio\nimport micropip\nfrom pathlib import Path\npath = Path('${path}')\n` +
                `packages = [line.strip() for line in path.read_text().splitlines() if line.strip() and not line.startswith('#')]\n` +
                `if packages:\n    await micropip.install(packages)\n`
            );
            appendLog('\r\n# Requirements installed.\r\n');
            return;
          } catch (error) {
            appendLog(`\r\n# Failed to install requirements: ${String(error)}\r\n`);
            return;
          }
        }

        if (trimmed.startsWith('pip install')) {
          const packages = trimmed.replace(/^pip install\s+/, '').split(/\s+/).filter(Boolean);
          if (!packages.length) {
            appendLog('\r\n# Specify at least one package to install.\r\n');
            return;
          }

          const installList = packages.map((pkg) => `"${pkg}"`).join(', ');
          await pyodide.runPythonAsync(`import micropip\nawait micropip.install([${installList}])`);
          appendLog('\r\n# Packages installed.\r\n');
          return;
        }

        if (/^(python|python3)\s+/.test(trimmed)) {
          const target = trimmed.replace(/^(python|python3)\s+/, '').trim();
          const fullPath = target.startsWith('/') ? target : `${NODE_WORKSPACE_DIR}/${target}`;
          await patchPythonNetworking(pyodide);
          await pyodide.runPythonAsync(
            `import runpy\nimport sys\nsys.argv = ['${fullPath}']\nrunpy.run_path('${fullPath}', run_name='__main__')\n`
          );
          setPreviewUrl(PYTHON_DEFAULT_PREVIEW);
          setPreviewRuntime('python');
          appendLog(`\r\n# Python application running at ${PYTHON_DEFAULT_PREVIEW}\r\n`);
          updatePythonPreview();
          return;
        }

        if (trimmed.startsWith('flask run')) {
          await patchPythonNetworking(pyodide);
          await pyodide.runPythonAsync(
            `import os\nimport runpy\nos.environ.setdefault('FLASK_APP', 'app.py')\n` +
              `os.environ.setdefault('FLASK_RUN_PORT', '5000')\n` +
              `runpy.run_module('flask', run_name='__main__')\n`
          );
          setPreviewUrl(PYTHON_DEFAULT_PREVIEW);
          setPreviewRuntime('python');
          appendLog(`\r\n# Flask application running at ${PYTHON_DEFAULT_PREVIEW}\r\n`);
          updatePythonPreview();
          return;
        }

        if (trimmed.startsWith('uvicorn ')) {
          const args = trimmed.replace(/^uvicorn\s+/, '').split(/\s+/);
          const appSpec = args[0];
          const portFlagIndex = args.findIndex((arg) => arg === '--port' || arg === '-p');
          const port = portFlagIndex >= 0 && args[portFlagIndex + 1] ? args[portFlagIndex + 1] : '8000';
          await patchPythonNetworking(pyodide);
          await pyodide.runPythonAsync(
            `import uvicorn\nconfig = uvicorn.Config('${appSpec}', host='0.0.0.0', port=${port}, reload=False)\n` +
              `server = uvicorn.Server(config)\nawait server.serve()\n`
          );
          const url = `https://pyodide-http.local:${port}/`;
          setPreviewUrl(url);
          setPreviewRuntime('python');
          appendLog(`\r\n# Uvicorn server running at ${url}\r\n`);
          updatePythonPreview();
          return;
        }

        await pyodide.runPythonAsync(trimmed);
        updatePythonPreview();
      };

      pythonPendingCommandRef.current = runCommandAsync();
      try {
        await pythonPendingCommandRef.current;
      } finally {
        pythonPendingCommandRef.current = null;
      }
      setStatusMessage('Python runtime ready.');
    },
    [appendLog, ensurePythonRuntime, patchPythonNetworking, updatePythonPreview]
  );

  const runCommand = useCallback(
    async (command: string) => {
      if (runtime === 'node') {
        await runNodeCommand(command);
      } else {
        await runPythonCommand(command);
      }
    },
    [runNodeCommand, runPythonCommand, runtime]
  );

  const stopPreview = useCallback(async () => {
    if (runtime === 'node') {
      if (activeProcessRef.current) {
        try {
          activeProcessRef.current.kill?.();
          appendLog('\r\n# Preview process terminated.\r\n');
        } catch (error) {
          console.warn('Failed to kill WebContainer process', error);
        }
        activeProcessRef.current = null;
      }
      setPreviewUrl(null);
      setPreviewRuntime(null);
      setStatusMessage('Preview stopped. You can restart or run commands manually.');
      return;
    }

    if (pythonRuntimeRef.current) {
      try {
        await pythonRuntimeRef.current.runPythonAsync(
          `import asyncio\n` +
            `for task in asyncio.all_tasks():\n` +
            `    if task is not asyncio.current_task():\n` +
            `        task.cancel()\n`
        );
      } catch (error) {
        console.warn('Failed to cancel python tasks', error);
      }
      setPreviewUrl(null);
      setPreviewRuntime(null);
      setStatusMessage('Python preview stopped.');
    }
  }, [appendLog, runtime]);

  const runPreviewCommands = useCallback(
    async (targetApp: GeneratedApp) => {
      const runtimeConfig = targetApp.runtime;
      if (!runtimeConfig) {
        appendLog('\r\n# No runtime commands provided in the generated result.\r\n');
        return;
      }

      const setupCommands = runtimeConfig.setup || [];
      const startCommands = runtimeConfig.previewCommands?.length
        ? runtimeConfig.previewCommands
        : runtimeConfig.start || [];

      if (runtime === 'node') {
        for (const command of setupCommands) {
          await runNodeCommand(command);
        }
        if (startCommands.length === 0) {
          appendLog('\r\n# No preview start command provided. Run your server manually in the terminal.\r\n');
          return;
        }
        const lastCommand = startCommands[startCommands.length - 1];
        for (let index = 0; index < startCommands.length - 1; index += 1) {
          await runNodeCommand(startCommands[index]);
        }

        const container = await ensureNodeContainer();
        if (!container) return;

        appendLog(`\r\n# Starting preview command: ${lastCommand}\r\n`);

        const shell = await container.spawn('bash', {
          args: ['-lc', `cd ${NODE_WORKSPACE_DIR} && ${lastCommand}`],
        });

        const reader = shell.output.getReader();
        activeProcessRef.current = shell;

        const pumpOutput = async () => {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              appendLog(decoderRef.current.decode(value));
            }
          }
        };

        pumpOutput().catch((error) => console.warn('Preview output error', error));

        shell.exit.then((code) => {
          appendLog(`\r\n# Preview process exited with code ${code}\r\n`);
          if (activeProcessRef.current === shell) {
            activeProcessRef.current = null;
          }
        });

        setPreviewRuntime('node');
        setStatusMessage('Preview running. Connect through the embedded frame or external window.');
        return;
      }

      const pyodide = await ensurePythonRuntime();
      if (!pyodide) return;

      await patchPythonNetworking(pyodide);

      for (const command of setupCommands) {
        await runPythonCommand(command);
      }

      if (startCommands.length === 0) {
        appendLog('\r\n# No preview start command provided. Run your Python server manually in the terminal.\r\n');
        return;
      }

      for (const command of startCommands) {
        await runPythonCommand(command);
      }

      if (!previewUrl) {
        setPreviewUrl(PYTHON_DEFAULT_PREVIEW);
      }
      setPreviewRuntime('python');
      setStatusMessage('Preview running. Use the embedded frame to interact with your Python backend.');
    },
    [appendLog, ensureNodeContainer, ensurePythonRuntime, patchPythonNetworking, previewUrl, runNodeCommand, runPythonCommand, runtime]
  );

  const startPreview = useCallback(
    async (targetApp: GeneratedApp) => {
      setIsStartingPreview(true);
      try {
        await syncWorkspace(targetApp);
        await runPreviewCommands(targetApp);
      } catch (error) {
        console.error('Failed to start preview', error);
        toast({
          title: 'Failed to start preview',
          description: error instanceof Error ? error.message : 'Unexpected error during preview startup.',
          variant: 'destructive',
        });
      } finally {
        setIsStartingPreview(false);
      }
    },
    [runPreviewCommands, syncWorkspace, toast]
  );

  const restartPreview = useCallback(
    async (targetApp: GeneratedApp) => {
      await stopPreview();
      await startPreview(targetApp);
    },
    [startPreview, stopPreview]
  );

  useEffect(() => {
    setPreviewUrl(null);
    setPreviewRuntime(null);
    setRuntimeReady(false);
  }, [runtime]);

  useEffect(() => {
    return () => {
      nodeContainerRef.current?.teardown?.();
      nodeContainerRef.current = null;
    };
  }, []);

  const value = useMemo<PrismAgentRuntimeContextValue>(
    () => ({
      runtime,
      setRuntime,
      statusMessage,
      isBooting,
      isSyncing,
      isStartingPreview,
      previewUrl,
      pythonPreviewHtml,
      previewRuntime,
      runtimeReady,
      syncWorkspace,
      runCommand,
      startPreview,
      stopPreview,
      restartPreview,
      subscribeToLogs,
    }),
    [
      isBooting,
      isStartingPreview,
      isSyncing,
      previewRuntime,
      previewUrl,
      pythonPreviewHtml,
      restartPreview,
      runCommand,
      runtime,
      runtimeReady,
      setRuntime,
      startPreview,
      statusMessage,
      stopPreview,
      subscribeToLogs,
      syncWorkspace,
    ]
  );

  return <PrismAgentRuntimeContext.Provider value={value}>{children}</PrismAgentRuntimeContext.Provider>;
};

export const usePrismAgentRuntime = () => {
  const context = useContext(PrismAgentRuntimeContext);
  if (!context) {
    throw new Error('usePrismAgentRuntime must be used within a PrismAgentRuntimeProvider');
  }
  return context;
};
