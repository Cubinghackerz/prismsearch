
export type ChatModel = 'claude' | 'gpt' | 'gemini';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ModelUsage {
  claude: number;
  gpt: number;
  gemini: number | null;
}

export interface ChatContextType {
  chatId: string | null;
  messages: ChatMessage[];
  modelUsage: ModelUsage;
  selectedModel: ChatModel;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  selectModel: (model: ChatModel) => void;
}
