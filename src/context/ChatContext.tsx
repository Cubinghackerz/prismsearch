
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';
import { useToast } from '@/hooks/use-toast';
import {
  CodeGenerationPlan,
  DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
  GeneratedApp,
  generateCodePlan,
  generateWebApp,
} from '@/services/codeGenerationService';
import { mathJaxService } from '@/services/mathJaxService';
import {
  DEFAULT_FINANCE_SYMBOLS,
  fetchStockQuotes,
} from '@/services/financeService';
import { computeGraphCommand, GraphCommandResult } from '@/services/graphingService';
import {
  buildWorkflowPlan,
} from '@/services/workflowService';
import type { WorkflowExecutionPlan } from '@/services/workflowService';

export type ChatCommandKey =
  | 'summarize'
  | 'explain'
  | 'math'
  | 'todo'
  | 'translate'
  | 'define'
  | 'quote'
  | 'weather'
  | 'search'
  | 'remind'
  | 'calc'
  | 'table'
  | 'wiki'
  | 'news'
  | 'chess'
  | 'music'
  | 'review'
  | 'script'
  | 'finance'
  | 'graph'
  | 'workflow';

export type SupportedCommand = ChatCommandKey | 'code';

export interface FinanceCommandResult {
  quotes: StockQuote[];
  fetchedAt: string;
  symbols: string[];
  source: string;
  note?: string;
  fallbackUsed?: boolean;
}

interface LocalCommandExecution {
  content: string;
  financeData?: FinanceCommandResult;
  graphData?: GraphCommandResult;
  workflowData?: WorkflowExecutionPlan;
}

interface ChatCommandDefinition {
  key: ChatCommandKey;
  label: string;
  description: string;
  promptBuilder: (input: string) => string;
  localHandler?: (input: string) => Promise<LocalCommandExecution>;
}

const createBetaPrompt = (commandLabel: string, guidance: string) =>
  (input: string) => `You are responding to Prism Chat's ${commandLabel} command. This capability is currently in beta, so provide thoughtful, reliable, and well-structured results.

${guidance}

User input:
${input}

Response requirements:
- Begin with "**${commandLabel} (beta)**" followed by a concise result title.
- Use clear markdown formatting, keeping the answer actionable and easy to skim.
- Mention any limitations, assumptions, or next steps when relevant.`;

const extractTickerSymbols = (input: string): string[] => {
  const matches = input.toUpperCase().match(/\b[A-Z]{1,5}(?:\.[A-Z]{1,2})?\b/g);
  if (!matches) {
    return [];
  }

  return Array.from(new Set(matches.map((symbol) => symbol.replace(/[^A-Z.]/g, '')))).filter(Boolean);
};

const CHAT_COMMAND_DEFINITIONS: Record<ChatCommandKey, ChatCommandDefinition> = {
  summarize: {
    key: 'summarize',
    label: '/summarize',
    description: 'Get a concise summary of text, notes, or a linked resource.',
    promptBuilder: createBetaPrompt(
      '/summarize',
      'Summarize the provided material, capturing the key takeaways, critical details, and optional action items. When a URL is supplied, infer likely content from context and state if direct access is unavailable.'
    ),
  },
  explain: {
    key: 'explain',
    label: '/explain',
    description: 'Break down a concept, topic, or piece of code in approachable terms.',
    promptBuilder: createBetaPrompt(
      '/explain',
      'Provide an easy-to-follow explanation that balances high-level intuition with important specifics. Include analogies, examples, or visualizations when they improve clarity.'
    ),
  },
  math: {
    key: 'math',
    label: '/math',
    description: 'Work through math problems step by step with clear reasoning.',
    promptBuilder: createBetaPrompt(
      '/math',
      'Solve the problem methodically, showing each algebraic or numerical step. Highlight formulas used, note assumptions, and finish with the final answer.'
    ),
  },
  todo: {
    key: 'todo',
    label: '/todo',
    description: 'Create a quick to-do list or checklist from a short brief.',
    promptBuilder: createBetaPrompt(
      '/todo',
      'Transform the request into an actionable checklist. Group related tasks, suggest owners or due dates when implied, and highlight any blockers.'
    ),
  },
  translate: {
    key: 'translate',
    label: '/translate',
    description: 'Translate sentences or words into a requested language instantly.',
    promptBuilder: createBetaPrompt(
      '/translate',
      'Detect the desired target language from the prompt (e.g., "to Spanish") and provide the translation. Include the detected source language, pronunciation hints when helpful, and note any ambiguity.'
    ),
  },
  define: {
    key: 'define',
    label: '/define',
    description: 'Look up definitions for words, acronyms, or technical terms.',
    promptBuilder: createBetaPrompt(
      '/define',
      'Provide the primary definition, pronunciation guidance, part of speech, and notable alternative meanings or related terms.'
    ),
  },
  quote: {
    key: 'quote',
    label: '/quote',
    description: 'Share an inspirational or themed quote on demand.',
    promptBuilder: createBetaPrompt(
      '/quote',
      'Offer an inspirational quote that matches the requested tone or topic. Attribute the quote to the correct author and include a short reflection or takeaway.'
    ),
  },
  weather: {
    key: 'weather',
    label: '/weather',
    description: 'Provide current weather insights for a specified city.',
    promptBuilder: createBetaPrompt(
      '/weather',
      'Provide a concise weather outlook for the specified location using the latest knowledge you have. Clearly state that conditions may have changed since your training data and recommend verifying with a live source.'
    ),
  },
  search: {
    key: 'search',
    label: '/search',
    description: 'Run a quick research sweep with sources and key findings.',
    promptBuilder: createBetaPrompt(
      '/search',
      'Simulate a live web search by outlining likely up-to-date findings, citing plausible sources, and clearly labeling anything that may be outdated or estimated. Encourage the user to verify with live links.'
    ),
  },
  remind: {
    key: 'remind',
    label: '/remind',
    description: 'Draft reminder notes for tasks, meetings, or follow-ups.',
    promptBuilder: createBetaPrompt(
      '/remind',
      'Turn the request into a reminder schedule. Specify the task, timing, channel (if implied), and any preparation steps. Clarify that reminders are not automatically scheduled.'
    ),
  },
  calc: {
    key: 'calc',
    label: '/calc',
    description: 'Perform quick calculations with accurate results.',
    promptBuilder: createBetaPrompt(
      '/calc',
      'Compute the requested value precisely. Show the formula or reasoning used, and present the final answer clearly. If multiple calculations are requested, tabulate the results.'
    ),
  },
  table: {
    key: 'table',
    label: '/table',
    description: 'Format supplied data into a readable table.',
    promptBuilder: createBetaPrompt(
      '/table',
      'Organize the provided information into a clean markdown table. Include headers, units, and a short caption explaining what the table represents.'
    ),
  },
  wiki: {
    key: 'wiki',
    label: '/wiki',
    description: 'Summarize the key points from a Wikipedia-style article.',
    promptBuilder: createBetaPrompt(
      '/wiki',
      'Deliver a concise, neutral summary similar to a Wikipedia lead section. Cover essential facts, dates, and context. Mention if specific details may have changed since your last update.'
    ),
  },
  news: {
    key: 'news',
    label: '/news',
    description: 'Outline recent headlines or developments for a topic or region.',
    promptBuilder: createBetaPrompt(
      '/news',
      'Summarize the latest known developments about the requested topic, referencing likely reputable outlets. Clearly state the recency limitations and encourage verification against live news feeds.'
    ),
  },
  chess: {
    key: 'chess',
    label: '/chess',
    description: 'Analyze a chess position or suggest strategic moves.',
    promptBuilder: createBetaPrompt(
      '/chess',
      'If a FEN string or move history is provided, analyze the resulting position and suggest candidate moves with reasoning. Highlight tactical ideas, threats, and long-term plans.'
    ),
  },
  music: {
    key: 'music',
    label: '/music',
    description: 'Generate playlists, song ideas, or pull up lyrics.',
    promptBuilder: createBetaPrompt(
      '/music',
      'Respond with a themed playlist, lyric excerpt, or musical suggestion based on the prompt. Include artist names, release years when known, and a short rationale for each pick.'
    ),
  },
  review: {
    key: 'review',
    label: '/review',
    description: 'Offer constructive feedback on text, code, or media.',
    promptBuilder: createBetaPrompt(
      '/review',
      'Provide a balanced critique, highlighting strengths, areas for improvement, and actionable recommendations. Structure the feedback in sections (e.g., Summary, Highlights, Opportunities).'
    ),
  },
  script: {
    key: 'script',
    label: '/script',
    description: 'Generate scripts or automation snippets for common tasks.',
    promptBuilder: createBetaPrompt(
      '/script',
      'Produce a clear, well-commented script in the language implied by the user. Explain how to run it, list any dependencies, and include safety considerations.'
    ),
  },
  finance: {
    key: 'finance',
    label: '/finance',
    description: 'Check live stock quotes and intraday performance snapshots.',
    promptBuilder: createBetaPrompt(
      '/finance',
      'Summarize the latest available market data for the requested ticker symbols. Highlight current price, absolute and percentage change, notable volume shifts, and relevant context such as recent highs or lows.'
    ),
    localHandler: async (input: string) => {
      const tickers = extractTickerSymbols(input);
      const fallbackUsed = tickers.length === 0;
      const symbolsToQuery = fallbackUsed ? DEFAULT_FINANCE_SYMBOLS : tickers;
      const { quotes, source, usedFallbackSource } = await fetchStockQuotes(symbolsToQuery);

      if (!quotes.length) {
        return {
          content:
            'Unable to retrieve live market data right now. Please check the ticker symbols and try again shortly.',
        };
      }

      const fetchedAt = new Date().toISOString();
      const summaryLines = quotes
        .map((quote) => {
          const changeSymbol = quote.change >= 0 ? '+' : '';
          return `• **${quote.symbol}** — $${quote.price.toFixed(2)} (${changeSymbol}${quote.change.toFixed(2)}, ${
            changeSymbol + quote.changePercent.toFixed(2)
          }%)`;
        })
        .join('\n');

      const intro = fallbackUsed
        ? 'Showing a quick market pulse for today\'s most-watched tickers:'
        : `Here\'s the latest snapshot for ${symbolsToQuery.join(', ')}:`;

      const sourceLabel = usedFallbackSource
        ? `${source} (web snapshot fallback)`
        : source;

      return {
        content: `**/finance (beta)** Live market data\n\n${intro}\n\n${summaryLines}\n\n_Data refreshes at least six times per day in Prism Finance. Source: ${sourceLabel}. Market data provided for informational purposes only._`,
        financeData: {
          quotes,
          fetchedAt,
          symbols: symbolsToQuery,
          source: sourceLabel,
          fallbackUsed,
          note: [
            fallbackUsed
              ? 'Showing default market movers while no specific tickers were supplied.'
              : 'Live data for your requested tickers. Refresh Prism Finance for full dashboards.',
            usedFallbackSource
              ? 'Primary market feed was unavailable, so we captured the latest trusted web snapshot.'
              : 'Powered by the primary live market feed.',
          ].join(' '),
        },
      };
    },
  },
  graph: {
    key: 'graph',
    label: '/graph',
    description: 'Plot equations on an interactive graph and export the results.',
    promptBuilder: createBetaPrompt(
      '/graph',
      'Help the user interpret the plotted equations, noting key features like intercepts, extrema, or intersections when visible.'
    ),
    localHandler: async (input: string) => {
      const { result, summaryLines } = computeGraphCommand(input);

      const sampleCount = result.series[0]?.points.length ?? 0;
      const intro = `Plotted ${result.series.length} ${result.series.length === 1 ? 'equation' : 'equations'} from x = ${
        result.xMin.toFixed(2)
      } to x = ${result.xMax.toFixed(2)} with ${sampleCount} samples.`;

      const body = summaryLines.join('\n');
      const notes = result.notes.length > 0 ? `\n\n_Notes:_\n${result.notes.map((note) => `- ${note}`).join('\n')}` : '';

      return {
        content: `**/graph (beta)** Interactive plots ready\n\n${intro}\n${body ? `\n${body}` : ''}\n\n_Explore the graph below to hover for coordinates, toggle series, and export the visualization as SVG or CSV._${notes}`,
        graphData: result,
      };
    },
  },
  workflow: {
    key: 'workflow',
    label: '/workflow',
    description: 'Bundle multiple commands into reusable automations and schedules.',
    promptBuilder: createBetaPrompt(
      '/workflow',
      'Outline the proposed automation, highlighting the goal, cadence, and each command-driven step. Suggest any assumptions or integrations needed to run it successfully.'
    ),
    localHandler: async (input: string) => {
      const plan = buildWorkflowPlan(input);
      const stepList = plan.steps
        .map((step, index) => `- Step ${index + 1}: ${getCommandLabel(step.command)} ${step.input ? `– ${step.input}` : ''}`)
        .join('\n');
      const notesBlock = plan.notes.length > 0 ? `\n\n${plan.notes.map((note) => `- ${note}`).join('\n')}` : '';

      return {
        content: `**/workflow (beta)** Workflow builder ready\n\n${plan.summary}${notesBlock}${stepList ? `\n\n${stepList}` : ''}\n\nUse the panel below to adjust steps and run them in chat.`,
        workflowData: plan,
      };
    },
  },
};

export const getCommandLabel = (command: SupportedCommand): string => {
  if (command === 'code') {
    return '/code';
  }

  return CHAT_COMMAND_DEFINITIONS[command]?.label ?? `/${command}`;
};

export const CHAT_COMMAND_GUIDE: { key: SupportedCommand; label: string; description: string }[] = [
  {
    key: 'code',
    label: '/code (beta)',
    description: 'Generate multi-language web app projects with previews and planning.',
  },
  ...Object.values(CHAT_COMMAND_DEFINITIONS).map((command) => ({
    key: command.key,
    label: `${command.label} (beta)`,
    description: command.description,
  })),
];

export const isChatCommandKey = (value: string): value is ChatCommandKey =>
  Object.prototype.hasOwnProperty.call(CHAT_COMMAND_DEFINITIONS, value);

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: ChatModel;
  createdAt: Date;
  updatedAt: Date;
}

export type CodePlanStatus = 'awaiting-user' | 'generating' | 'declined' | 'error' | 'completed';

export interface CodePlanState {
  plan: CodeGenerationPlan;
  prompt: string;
  status: CodePlanStatus;
  planModel?: string;
  rawResponse?: string;
  generationModel?: string;
  error?: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  formattedContent?: string;
  isUser: boolean;
  timestamp: Date;
  parentMessageId?: string;
  attachments?: any[];
  type?: 'text' | 'code' | 'code-plan' | 'workflow';
  codeResult?: GeneratedApp;
  codePrompt?: string;
  usedModel?: string;
  rawResponse?: string;
  codePlan?: CodePlanState;
  command?: SupportedCommand;
  financeData?: FinanceCommandResult;
  graphData?: GraphCommandResult;
  workflowData?: WorkflowExecutionPlan;
}

export type ChatModel =
  | 'gemini'
  | 'gemini-2.5-pro'
  | 'mistral'
  | 'mistral-medium-3'
  | 'groq'
  | 'groq-qwen-qwq'
  | 'groq-llama4-scout'
  | 'groq-llama4-maverick'
  | 'groq-llama-guard'
  | 'groq-llama31-8b-instant'
  | 'groq-llama3-8b'
  | 'azure-gpt4-nano'
  | 'azure-o4-mini';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  sendMessageWithFiles: (content: string, attachments: any[], parentMessageId?: string) => Promise<void>;
  generateCodeFromPrompt: (prompt: string) => Promise<void>;
  executeCommand: (command: ChatCommandKey, input: string) => Promise<ChatMessage | null>;
  approveCodePlan: (messageId: string) => Promise<void>;
  declineCodePlan: (messageId: string) => void;
  updateCodePlan: (messageId: string, updatedPlan: CodeGenerationPlan) => void;
  isLoading: boolean;
  isTyping: boolean;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
  selectedModel: ChatModel;
  chatId: string | null;
  runDeepResearch: (topic: string) => Promise<void>;
  savedChats: SavedChat[];
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  isTemporaryMode: boolean;
  toggleTemporaryMode: () => void;
  saveCurrentChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-2.5-pro');
  const [chatId, setChatId] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isTemporaryMode, setIsTemporaryMode] = useState<boolean>(false);
  const { consume, limits } = useDailyQueryLimit();
  const { toast } = useToast();

  // Load saved chats on mount
  useEffect(() => {
    loadSavedChats();
    loadTemporaryMode();
  }, []);

  const loadSavedChats = () => {
    try {
      const stored = localStorage.getItem('prism_saved_chats');
      if (stored) {
        const parsed = JSON.parse(stored);
        const chats = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSavedChats(chats);
      }
    } catch (error) {
      console.error('Error loading saved chats:', error);
    }
  };

  const loadTemporaryMode = () => {
    try {
      const stored = localStorage.getItem('prism_temporary_mode');
      if (stored) {
        setIsTemporaryMode(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading temporary mode:', error);
    }
  };

  const saveChatToStorage = (chatToSave: SavedChat) => {
    try {
      const existingChats = [...savedChats];
      const existingIndex = existingChats.findIndex(chat => chat.id === chatToSave.id);
      
      if (existingIndex >= 0) {
        existingChats[existingIndex] = chatToSave;
      } else {
        existingChats.unshift(chatToSave);
      }
      
      // Keep only the 50 most recent chats
      const limitedChats = existingChats.slice(0, 50);
      
      setSavedChats(limitedChats);
      localStorage.setItem('prism_saved_chats', JSON.stringify(limitedChats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const generateChatTitle = (firstMessage: string): string => {
    const truncated = firstMessage.slice(0, 50);
    return truncated.length < firstMessage.length ? truncated + '...' : truncated;
  };

  const saveCurrentChat = () => {
    if (isTemporaryMode || !chatId || messages.length === 0) return;

    const firstUserMessage = messages.find(msg => msg.isUser)?.content || 'New Chat';
    const chatTitle = generateChatTitle(firstUserMessage);

    const chatToSave: SavedChat = {
      id: chatId,
      title: chatTitle,
      messages: messages,
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    saveChatToStorage(chatToSave);
  };

  // Auto-save chat after each message (when not in temporary mode)
  useEffect(() => {
    if (!isTemporaryMode && chatId && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isTemporaryMode, chatId]);

  const sendMessageWithFiles = async (content: string, attachments: any[] = [], parentMessageId?: string) => {
    if (!consume('chatPrompts')) {
      toast({
        title: 'Daily limit reached',
        description: `You've reached your daily limit of ${limits.chatPrompts} Prism Chat prompts. Try again tomorrow.`,
        variant: 'destructive',
      });
      return;
    }

    // Initialize chat if needed
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: content,
      isUser: true,
      timestamp: new Date(),
      parentMessageId: parentMessageId,
      attachments: attachments,
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 30 seconds'));
      }, 30000);
    });

    try {
      const responsePromise = supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: content,
          chatId: currentChatId,
          chatHistory: messages,
          model: selectedModel, // Use selected model instead of forcing Gemini
          attachments: attachments
        }
      });
      
      // Race the response against the timeout
      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error('Request timed out after 30 seconds');
        })
      ]);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
        parentMessageId: parentMessageId,
        type: 'text',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        parentMessageId: parentMessageId,
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const executeCommand = async (command: ChatCommandKey, input: string): Promise<ChatMessage | null> => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      toast({
        title: 'Missing details',
        description: `Please add details after ${getCommandLabel(command)} to use the command.`,
        variant: 'destructive',
      });
      return null;
    }

    if (!consume('chatCommands')) {
      toast({
        title: 'Daily limit reached',
        description: `You've reached your daily limit of ${limits.chatCommands} Prism Chat commands. Try again tomorrow.`,
        variant: 'destructive',
      });
      return null;
    }

    const definition = CHAT_COMMAND_DEFINITIONS[command];
    if (!definition) {
      toast({
        title: 'Unsupported command',
        description: 'That command is not available right now.',
        variant: 'destructive',
      });
      return null;
    }

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
    }

    const displayContent = `${definition.label} (beta) ${trimmedInput}`.trim();

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: displayContent,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
      command,
    };

    const historyWithCommand = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    if (command === 'math' || command === 'calc' || command === 'graph') {
      mathJaxService.initialize().catch((error) => {
        console.warn('MathJax initialization warning:', error);
      });
    }

    if (definition.localHandler) {
      try {
        const { content, financeData, graphData, workflowData } = await definition.localHandler(trimmedInput);

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content,
          isUser: false,
          timestamp: new Date(),
          type: workflowData ? 'workflow' : 'text',
          command,
          financeData,
          graphData,
          workflowData,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return assistantMessage;
      } catch (error) {
        console.error('Error executing local command handler:', error);
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          content: 'Sorry, there was an error processing that command. Please try again in a moment.',
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          command,
        };

        setMessages((prev) => [...prev, errorMessage]);
        toast({
          title: 'Command failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }

      return null;
    }

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Command request timed out after 30 seconds'));
      }, 30000);
    });

    try {
      const responsePromise = supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: definition.promptBuilder(trimmedInput),
          chatId: currentChatId,
          chatHistory: historyWithCommand,
          model: selectedModel,
          command,
        }
      });

      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error('Command request timed out after 30 seconds');
        })
      ]);

      if (error) {
        console.error('Supabase function error (command):', error);
        throw error;
      }

      const responseText = data?.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        command,
      };

      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (error) {
      console.error('Error executing command:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing that command. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        command,
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Command failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
    return null;
  };

  const generateCodeFromPrompt = async (rawPrompt: string) => {
    const trimmedPrompt = rawPrompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    if (!consume('chatCommands')) {
      toast({
        title: 'Daily limit reached',
        description: `You've reached your daily limit of ${limits.chatCommands} Prism Chat commands. Try again tomorrow.`,
        variant: 'destructive',
      });
      return;
    }

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
    }

    const displayPrompt = `/code (beta) ${trimmedPrompt}`.trim();

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: displayPrompt,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
      command: 'code',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    const generationChatId = `chat-code-${currentChatId}`;

    try {
      const { plan, usedModel, rawResponse } = await generateCodePlan({
        prompt: trimmedPrompt,
        model: selectedModel,
        chatId: `${generationChatId}-plan`,
        fallbackModels: DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
      });

      const planMessage: ChatMessage = {
        id: uuidv4(),
        content: plan.summary || 'Proposed development plan',
        isUser: false,
        timestamp: new Date(),
        type: 'code-plan',
        codePlan: {
          plan,
          prompt: trimmedPrompt,
          status: 'awaiting-user',
          planModel: usedModel,
          rawResponse,
          lastUpdated: new Date().toISOString(),
        },
        command: 'code',
      };

      setMessages(prev => [...prev, planMessage]);

      toast({
        title: 'Plan ready',
        description: 'Review the proposed plan, then approve or edit it before generation.',
      });
    } catch (error) {
      console.error('Error generating development plan:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: 'Sorry, there was an error creating the development plan. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        command: 'code',
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Plan generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const approveCodePlan = async (messageId: string) => {
    const planMessage = messages.find((msg) => msg.id === messageId);
    if (!planMessage || !planMessage.codePlan) {
      return;
    }

    if (planMessage.codePlan.status === 'generating') {
      return;
    }

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
    }

    const generationChatId = `chat-code-${currentChatId}`;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.codePlan
          ? {
              ...msg,
              codePlan: {
                ...msg.codePlan,
                status: 'generating',
                error: undefined,
                lastUpdated: new Date().toISOString(),
              },
            }
          : msg
      )
    );

    setIsLoading(true);
    setIsTyping(true);

    try {
      const { app, usedModel, rawResponse } = await generateWebApp({
        prompt: planMessage.codePlan.prompt,
        model: selectedModel,
        chatId: `${generationChatId}-build`,
        fallbackModels: DEFAULT_CODE_GENERATION_FALLBACK_ORDER,
        plan: planMessage.codePlan.plan,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.codePlan
            ? {
                ...msg,
                codePlan: {
                  ...msg.codePlan!,
                  status: 'completed',
                  generationModel: usedModel,
                  lastUpdated: new Date().toISOString(),
                },
              }
            : msg
        )
      );

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: app.description || 'Web application generated successfully.',
        isUser: false,
        timestamp: new Date(),
        type: 'code',
        codeResult: app,
        codePrompt: planMessage.codePlan.prompt,
        usedModel,
        rawResponse,
        command: 'code',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      toast({
        title: 'Web app generated',
        description:
          usedModel !== selectedModel
            ? `Primary model unavailable. Used ${usedModel} instead.`
            : 'Preview and refine your new app using the embedded tools.',
      });
    } catch (error) {
      console.error('Error generating code from approved plan:', error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.codePlan
            ? {
                ...msg,
                codePlan: {
                  ...msg.codePlan!,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  lastUpdated: new Date().toISOString(),
                },
              }
            : msg
        )
      );

      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const declineCodePlan = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.codePlan
          ? {
              ...msg,
              codePlan: {
                ...msg.codePlan,
                status: 'declined',
                lastUpdated: new Date().toISOString(),
              },
            }
          : msg
      )
    );
  };

  const updateCodePlan = (messageId: string, updatedPlan: CodeGenerationPlan) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.codePlan
          ? {
              ...msg,
              content: updatedPlan.summary || msg.content,
              codePlan: {
                ...msg.codePlan,
                plan: updatedPlan,
                status: 'awaiting-user',
                error: undefined,
                generationModel: undefined,
                lastUpdated: new Date().toISOString(),
              },
            }
          : msg
      )
    );

    toast({
      title: 'Plan updated',
      description: 'Your modifications have been applied. Approve the plan to continue.',
    });
  };

  const sendMessage = async (content: string, parentMessageId?: string) => {
    await sendMessageWithFiles(content, [], parentMessageId);
  };

  const startNewChat = useCallback(() => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setMessages([]);
  }, []);

  const loadChat = (loadChatId: string) => {
    const chatToLoad = savedChats.find(chat => chat.id === loadChatId);
    if (chatToLoad) {
      setChatId(chatToLoad.id);
      setMessages(chatToLoad.messages);
      setSelectedModel(chatToLoad.model);
      
      toast({
        title: "Chat loaded",
        description: `Loaded "${chatToLoad.title}"`
      });
    }
  };

  const deleteChat = (deleteChatId: string) => {
    const updatedChats = savedChats.filter(chat => chat.id !== deleteChatId);
    setSavedChats(updatedChats);
    localStorage.setItem('prism_saved_chats', JSON.stringify(updatedChats));
    
    // If we're deleting the current chat, start a new one
    if (deleteChatId === chatId) {
      startNewChat();
    }
    
    toast({
      title: "Chat deleted",
      description: "The chat has been removed from your saved chats."
    });
  };

  const clearAllChats = () => {
    setSavedChats([]);
    localStorage.removeItem('prism_saved_chats');
    startNewChat();
    
    toast({
      title: "All chats cleared",
      description: "All saved chats have been removed."
    });
  };

  const toggleTemporaryMode = () => {
    const newMode = !isTemporaryMode;
    setIsTemporaryMode(newMode);
    localStorage.setItem('prism_temporary_mode', JSON.stringify(newMode));
    
    toast({
      title: newMode ? "Temporary mode enabled" : "Temporary mode disabled",
      description: newMode 
        ? "Your chats will not be saved to device storage."
        : "Your chats will be automatically saved to device storage."
    });
  };

  const selectModel = (model: ChatModel) => {
    setSelectedModel(model);
  };

  const runDeepResearch = async (topic: string) => {
    if (isLoading) return;

    if (!consume('chatPrompts')) {
      toast({
        title: 'Daily limit reached',
        description: `You've reached your daily limit of ${limits.chatPrompts} Prism Chat prompts. Try again tomorrow.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!chatId) {
      startNewChat();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: topic,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 45 seconds'));
      }, 45000);
    });

    try {
      const responsePromise = supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: topic,
          chatId: chatId,
          chatHistory: messages,
          model: selectedModel, // Use selected model instead of forcing Gemini
          deepResearch: true
        }
      });
      
      // Race the response against the timeout
      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error('Deep research request timed out after 45 seconds');
        })
      ]);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const responseText = data.response || 'No response received';

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: responseText,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in deep research:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: 'Sorry, there was an error processing your deep research request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      sendMessageWithFiles,
      generateCodeFromPrompt,
      executeCommand,
      approveCodePlan,
      declineCodePlan,
      updateCodePlan,
      isLoading,
      isTyping,
      startNewChat,
      selectModel,
      selectedModel,
      chatId,
      runDeepResearch,
      savedChats,
      loadChat,
      deleteChat,
      clearAllChats,
      isTemporaryMode,
      toggleTemporaryMode,
      saveCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
