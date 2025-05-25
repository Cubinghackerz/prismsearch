
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

export interface StreamChunk {
  content: string;
  finished: boolean;
}

export interface AzureOpenAIError {
  message: string;
  code?: string;
  type?: string;
}
