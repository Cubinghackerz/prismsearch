import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useUser } from '@clerk/clerk-react';
import nerdamer from 'nerdamer';
import 'nerdamer/Calculus.js';
import 'nerdamer/Algebra.js';
import 'nerdamer/Solve.js';
import { computeGraphCommand, GraphCommandResult } from '@/services/graphingService';
import { computeSurfaceGraph, Graph3DResult } from '@/services/graphing3dService';

const STORAGE_PREFIX = 'prism-math-engine-chat';

type MathEngineMode = 'fast' | 'thinking';

type MathEngineCommand = 'freeform' | 'factorise' | 'expand' | 'graph2D' | 'graph3D';

type MathEngineResult =
  | { kind: 'text' }
  | { kind: 'graph2d'; summary: string; payload: GraphCommandResult }
  | { kind: 'graph3d'; summary: string; payload: Graph3DResult };

export interface MathEngineMessage {
  id: string;
  role: 'user' | 'assistant';
  command: MathEngineCommand;
  content: string;
  mode: MathEngineMode;
  createdAt: string;
  result?: MathEngineResult;
}

interface ExecuteCommandPayload {
  command: MathEngineCommand;
  prompt: string;
}

interface MathEngineContextValue {
  messages: MathEngineMessage[];
  mode: MathEngineMode;
  setMode: (mode: MathEngineMode) => void;
  executeCommand: (payload: ExecuteCommandPayload) => Promise<void>;
  resetConversation: () => void;
  hasHistory: boolean;
  isProcessing: boolean;
}

const MathEngineContext = createContext<MathEngineContextValue | undefined>(undefined);

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `math-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_INTRO_MESSAGE: MathEngineMessage = {
  id: createId(),
  role: 'assistant',
  command: 'freeform',
  mode: 'fast',
  createdAt: new Date().toISOString(),
  content:
    'Hello! I am the Math Engine. Pick a command such as `/factorise`, `/expand`, `/graph2D`, or `/graph3D`, choose a mode, and type your expression. I will keep this conversation stored locally on your device.',
};

const sanitizeForSymbolic = (input: string): string =>
  input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/φ/g, 'phi')
    .replace(/γ/g, 'EulerGamma')
    .replace(/√/g, 'sqrt')
    .replace(/∞/g, 'Infinity');

const expressionToTeX = (expression: string): string => {
  try {
    const node = nerdamer(expression);
    return node.toTeX();
  } catch (error) {
    return expression;
  }
};

const wrapMath = (latex: string) => `$$${latex}$$`;

const usePersistentState = (storageKey: string) => {
  const [messages, setMessages] = useState<MathEngineMessage[]>(() => {
    if (typeof window === 'undefined') {
      return [DEFAULT_INTRO_MESSAGE];
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as MathEngineMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to parse Math Engine history:', error);
    }

    return [DEFAULT_INTRO_MESSAGE];
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to persist Math Engine history:', error);
    }
  }, [messages, storageKey]);

  return { messages, setMessages };
};

export const MathEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [mode, setMode] = useState<MathEngineMode>('fast');
  const [isProcessing, setIsProcessing] = useState(false);

  const storageKey = useMemo(() => {
    if (user?.id) {
      return `${STORAGE_PREFIX}-${user.id}`;
    }
    return `${STORAGE_PREFIX}-guest`;
  }, [user?.id]);

  const { messages, setMessages } = usePersistentState(storageKey);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as MathEngineMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to reload Math Engine history:', error);
    }

    setMessages([DEFAULT_INTRO_MESSAGE]);
  }, [storageKey]);

  const appendMessage = useCallback((message: MathEngineMessage) => {
    setMessages((current) => [...current, message]);
  }, [setMessages]);

  const executeCommand = useCallback<MathEngineContextValue['executeCommand']>(
    async ({ command, prompt }) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        return;
      }

      const timestamp = new Date().toISOString();
      const userMessage: MathEngineMessage = {
        id: createId(),
        role: 'user',
        command,
        content: trimmedPrompt,
        mode,
        createdAt: timestamp,
      };

      appendMessage(userMessage);
      setIsProcessing(true);

      const runWithDelay = async (task: () => Promise<MathEngineMessage>): Promise<void> => {
        if (mode === 'thinking') {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        try {
          const assistantMessage = await task();
          appendMessage(assistantMessage);
        } catch (error) {
          const assistantMessage: MathEngineMessage = {
            id: createId(),
            role: 'assistant',
            command,
            mode,
            createdAt: new Date().toISOString(),
            content:
              error instanceof Error
                ? `I ran into a problem: ${error.message}. Please adjust the expression and try again.`
                : 'I ran into an unexpected issue. Please try again.',
          };
          appendMessage(assistantMessage);
        } finally {
          setIsProcessing(false);
        }
      };

      const task = async (): Promise<MathEngineMessage> => {
        const createdAt = new Date().toISOString();

        if (command === 'graph2D') {
          const computation = computeGraphCommand(trimmedPrompt);
          const summary = computation.summaryLines.join('\n\n');

          return {
            id: createId(),
            role: 'assistant',
            command,
            mode,
            createdAt,
            content: summary,
            result: { kind: 'graph2d', summary, payload: computation.result },
          };
        }

        if (command === 'graph3D') {
          const computation = computeSurfaceGraph(trimmedPrompt);
          const summary = computation.summaryLines.join('\n\n');

          return {
            id: createId(),
            role: 'assistant',
            command,
            mode,
            createdAt,
            content: summary,
            result: { kind: 'graph3d', summary, payload: computation.result },
          };
        }

        const sanitized = sanitizeForSymbolic(trimmedPrompt);

        if (command === 'factorise') {
          const factored = nerdamer(`factor(${sanitized})`);
          const latex = factored.toTeX();
          const expanded = nerdamer(`expand(${factored.toString()})`).toTeX();

          const notes = mode === 'thinking'
            ? '\n\n**Verification**\n\n' + wrapMath(expanded)
            : '';

          return {
            id: createId(),
            role: 'assistant',
            command,
            mode,
            createdAt,
            content: `**Original**\n\n${wrapMath(expressionToTeX(sanitized))}\n\n**Factored form**\n\n${wrapMath(latex)}${notes}`,
          };
        }

        if (command === 'expand') {
          const expanded = nerdamer(`expand(${sanitized})`);
          const latex = expanded.toTeX();
          const factored = nerdamer(`factor(${expanded.toString()})`).toTeX();

          const notes = mode === 'thinking'
            ? '\n\n**Back-substitution**\n\n' + wrapMath(factored)
            : '';

          return {
            id: createId(),
            role: 'assistant',
            command,
            mode,
            createdAt,
            content: `**Expanded expression**\n\n${wrapMath(latex)}${notes}`,
          };
        }

        const evaluated = nerdamer(sanitized);
        const latex = evaluated.toTeX();
        const numeric = (() => {
          try {
            return evaluated.evaluate().text();
          } catch (error) {
            return null;
          }
        })();

        const explanationLines = [
          `**Result**\n\n${wrapMath(latex)}`,
        ];

        if (numeric && numeric !== evaluated.toString()) {
          explanationLines.push(`Numeric approximation: ${numeric}`);
        }

        if (mode === 'thinking') {
          explanationLines.push(
            'Thinking mode double-checks symbolic and numeric forms. Adjust the command if you need factoring, expansion, or graphing specifically.'
          );
        }

        return {
          id: createId(),
          role: 'assistant',
          command,
          mode,
          createdAt,
          content: explanationLines.join('\n\n'),
        };
      };

      await runWithDelay(task);
    },
    [appendMessage, mode]
  );

  const resetConversation = useCallback(() => {
    setMessages([DEFAULT_INTRO_MESSAGE]);
  }, [setMessages]);

  const value = useMemo<MathEngineContextValue>(() => ({
    messages,
    mode,
    setMode,
    executeCommand,
    resetConversation,
    hasHistory: messages.length > 1,
    isProcessing,
  }), [messages, mode, executeCommand, resetConversation, isProcessing]);

  return <MathEngineContext.Provider value={value}>{children}</MathEngineContext.Provider>;
};

export const useMathEngine = (): MathEngineContextValue => {
  const context = useContext(MathEngineContext);
  if (!context) {
    throw new Error('useMathEngine must be used within a MathEngineProvider');
  }
  return context;
};
