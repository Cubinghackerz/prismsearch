import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkspaceFile {
  path: string;
  content: string;
  language: string;
  modified: boolean;
}

interface PendingDiff {
  path: string;
  oldContent: string;
  newContent: string;
  action: 'create' | 'modify' | 'delete';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'error' | 'success' | 'command';
  message: string;
  command?: string;
}

interface WorkspaceState {
  files: Record<string, WorkspaceFile>;
  framework: string;
  language: string;
  projectName: string;
  dependencies: string[];
  isServerRunning: boolean;
  serverPort: number | null;
  logs: LogEntry[];
  pendingDiffs: Record<string, PendingDiff>;
}

interface WorkspaceContextType extends WorkspaceState {
  createFile: (path: string, content: string, language?: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  addPendingDiff: (diff: PendingDiff) => void;
  applyDiffs: () => Promise<void>;
  clearDiffs: () => void;
  runCommand: (command: string, args?: string[], cwd?: string) => Promise<string>;
  startDevServer: () => Promise<void>;
  stopDevServer: () => Promise<void>;
  addLog: (message: string, type?: LogEntry['type'], command?: string) => void;
  exportWorkspace: () => Promise<void>;
  setFramework: (framework: string) => void;
  setLanguage: (language: string) => void;
}

const initialState: WorkspaceState = {
  files: {},
  framework: 'React',
  language: 'TypeScript',
  projectName: 'workspace',
  dependencies: [],
  isServerRunning: false,
  serverPort: null,
  logs: [],
  pendingDiffs: {}
};

type WorkspaceAction =
  | { type: 'CREATE_FILE'; payload: { path: string; file: WorkspaceFile } }
  | { type: 'UPDATE_FILE'; payload: { path: string; content: string } }
  | { type: 'DELETE_FILE'; payload: { path: string } }
  | { type: 'ADD_PENDING_DIFF'; payload: { path: string; diff: PendingDiff } }
  | { type: 'APPLY_DIFFS' }
  | { type: 'CLEAR_DIFFS' }
  | { type: 'SET_SERVER_RUNNING'; payload: { isRunning: boolean; port?: number } }
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_FRAMEWORK'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string };

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'CREATE_FILE':
      return {
        ...state,
        files: {
          ...state.files,
          [action.payload.path]: action.payload.file
        }
      };
    
    case 'UPDATE_FILE':
      return {
        ...state,
        files: {
          ...state.files,
          [action.payload.path]: {
            ...state.files[action.payload.path],
            content: action.payload.content,
            modified: true
          }
        }
      };
    
    case 'DELETE_FILE':
      const { [action.payload.path]: deletedFile, ...remainingFiles } = state.files;
      return {
        ...state,
        files: remainingFiles
      };
    
    case 'ADD_PENDING_DIFF':
      return {
        ...state,
        pendingDiffs: {
          ...state.pendingDiffs,
          [action.payload.path]: action.payload.diff
        }
      };
    
    case 'APPLY_DIFFS':
      const newFiles = { ...state.files };
      Object.values(state.pendingDiffs).forEach(diff => {
        if (diff.action === 'create' || diff.action === 'modify') {
          newFiles[diff.path] = {
            path: diff.path,
            content: diff.newContent,
            language: getLanguageFromPath(diff.path),
            modified: false
          };
        } else if (diff.action === 'delete') {
          delete newFiles[diff.path];
        }
      });
      
      return {
        ...state,
        files: newFiles,
        pendingDiffs: {}
      };
    
    case 'CLEAR_DIFFS':
      return {
        ...state,
        pendingDiffs: {}
      };
    
    case 'SET_SERVER_RUNNING':
      return {
        ...state,
        isServerRunning: action.payload.isRunning,
        serverPort: action.payload.port || null
      };
    
    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-100) // Keep last 100 logs
      };
    
    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: []
      };
    
    case 'SET_FRAMEWORK':
      return {
        ...state,
        framework: action.payload
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    
    default:
      return state;
  }
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx': case 'ts': return 'typescript';
    case 'jsx': case 'js': return 'javascript';
    case 'vue': return 'vue';
    case 'svelte': return 'svelte';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    default: return 'text';
  }
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const { toast } = useToast();

  const createFile = useCallback((path: string, content: string, language?: string) => {
    const file: WorkspaceFile = {
      path,
      content,
      language: language || getLanguageFromPath(path),
      modified: false
    };
    dispatch({ type: 'CREATE_FILE', payload: { path, file } });
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    dispatch({ type: 'UPDATE_FILE', payload: { path, content } });
  }, []);

  const deleteFile = useCallback((path: string) => {
    dispatch({ type: 'DELETE_FILE', payload: { path } });
  }, []);

  const addPendingDiff = useCallback((diff: PendingDiff) => {
    dispatch({ type: 'ADD_PENDING_DIFF', payload: { path: diff.path, diff } });
  }, []);

  const applyDiffs = useCallback(async () => {
    dispatch({ type: 'APPLY_DIFFS' });
    addLog('Applied all pending file changes', 'success');
  }, []);

  const clearDiffs = useCallback(() => {
    dispatch({ type: 'CLEAR_DIFFS' });
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', command?: string) => {
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      command
    };
    dispatch({ type: 'ADD_LOG', payload: log });
  }, []);

  const runCommand = useCallback(async (command: string, args: string[] = [], cwd?: string): Promise<string> => {
    addLog(`$ ${command} ${args.join(' ')}`, 'command', command);
    
    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock responses for different commands
      let output = '';
      
      switch (command) {
        case 'npm':
          if (args[0] === 'install') {
            output = 'Dependencies installed successfully\nAdded 127 packages in 2.3s';
            addLog(output, 'success');
          } else if (args[0] === 'start' || args[0] === 'dev') {
            const port = 3000 + Math.floor(Math.random() * 1000);
            dispatch({ type: 'SET_SERVER_RUNNING', payload: { isRunning: true, port } });
            output = `Development server started on http://localhost:${port}`;
            addLog(output, 'success');
          } else if (args[0] === 'build') {
            output = 'Build completed successfully\nOutput: dist/';
            addLog(output, 'success');
          }
          break;
          
        case 'python':
          output = 'Python script executed successfully';
          addLog(output, 'success');
          break;
          
        case 'node':
          output = 'Node.js script executed successfully';
          addLog(output, 'success');
          break;
          
        case 'pip':
          if (args[0] === 'install') {
            output = 'Python packages installed successfully';
            addLog(output, 'success');
          }
          break;
          
        default:
          output = `Command '${command}' executed`;
          addLog(output, 'info');
      }
      
      return output;
    } catch (error) {
      const errorMsg = `Command failed: ${error}`;
      addLog(errorMsg, 'error');
      throw new Error(errorMsg);
    }
  }, [addLog]);

  const startDevServer = useCallback(async () => {
    try {
      await runCommand('npm', ['start']);
    } catch (error) {
      throw new Error('Failed to start development server');
    }
  }, [runCommand]);

  const stopDevServer = useCallback(async () => {
    dispatch({ type: 'SET_SERVER_RUNNING', payload: { isRunning: false } });
    addLog('Development server stopped', 'info');
  }, [addLog]);

  const exportWorkspace = useCallback(async () => {
    try {
      // Create and download a ZIP of all files
      const files = Object.values(state.files);
      const zip = new Blob(
        [JSON.stringify({ files, framework: state.framework, language: state.language }, null, 2)],
        { type: 'application/json' }
      );
      
      const url = URL.createObjectURL(zip);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.projectName}-workspace.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addLog('Workspace exported successfully', 'success');
    } catch (error) {
      addLog('Failed to export workspace', 'error');
      throw error;
    }
  }, [state, addLog]);

  const setFramework = useCallback((framework: string) => {
    dispatch({ type: 'SET_FRAMEWORK', payload: framework });
    addLog(`Framework changed to ${framework}`, 'info');
  }, [addLog]);

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    addLog(`Language changed to ${language}`, 'info');
  }, [addLog]);

  const contextValue: WorkspaceContextType = {
    ...state,
    createFile,
    updateFile,
    deleteFile,
    addPendingDiff,
    applyDiffs,
    clearDiffs,
    runCommand,
    startDevServer,
    stopDevServer,
    addLog,
    exportWorkspace,
    setFramework,
    setLanguage
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};