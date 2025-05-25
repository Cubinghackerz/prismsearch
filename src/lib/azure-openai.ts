
import OpenAI from 'openai';
import type { 
  ChatMessage, 
  ChatResponse, 
  AzureOpenAIConfig,
  AzureOpenAIError
} from '../types/azure-openai';

class AzureOpenAIService {
  private client: OpenAI;
  private deploymentName: string;
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
    this.deploymentName = config.deploymentName;
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: `${config.endpoint}openai/deployments/${config.deploymentName}`,
      defaultQuery: { 'api-version': config.apiVersion },
      defaultHeaders: {
        'api-key': config.apiKey,
      },
    });
  }

  async chat(
    messages: ChatMessage[], 
    options?: {
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<ChatResponse> {
    try {
      console.log(`Making Azure OpenAI request with ${messages.length} messages`);
      
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        max_tokens: options?.maxTokens || 1500,
        temperature: options?.temperature || 0.7,
        stream: options?.stream || false,
      });

      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('Invalid response from Azure OpenAI');
      }

      const content = response.choices[0].message.content || '';
      
      return {
        response: content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined
      };
    } catch (error) {
      console.error('Azure OpenAI Error:', error);
      const azureError: AzureOpenAIError = {
        message: error instanceof Error ? error.message : 'Unknown Azure OpenAI error',
        code: (error as any)?.code,
        type: (error as any)?.type,
      };
      throw new Error(`Azure OpenAI Error: ${azureError.message}`);
    }
  }

  async *chatStream(
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): AsyncGenerator<string, void, unknown> {
    try {
      console.log(`Making Azure OpenAI streaming request with ${messages.length} messages`);
      
      const stream = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        max_tokens: options?.maxTokens || 1500,
        temperature: options?.temperature || 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Azure OpenAI Stream Error:', error);
      throw new Error(`Failed to stream chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Connection test successful"' }
      ];
      
      const response = await this.chat(testMessages, { maxTokens: 50 });
      return response.response.includes('successful');
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Configuration for your specific Azure OpenAI setup
const AZURE_CONFIG: AzureOpenAIConfig = {
  endpoint: 'https://punar-maz8m55t-eastus2.cognitiveservices.azure.com/',
  apiKey: '', // Will be loaded from Supabase secrets
  deploymentName: 'o4-mini',
  apiVersion: '2025-01-01-preview',
};

// Singleton instance
let azureOpenAIInstance: AzureOpenAIService | null = null;

export function getAzureOpenAI(apiKey: string): AzureOpenAIService {
  if (!azureOpenAIInstance || AZURE_CONFIG.apiKey !== apiKey) {
    AZURE_CONFIG.apiKey = apiKey;
    azureOpenAIInstance = new AzureOpenAIService(AZURE_CONFIG);
  }
  return azureOpenAIInstance;
}

export { AzureOpenAIService };
export type { ChatMessage, ChatResponse, AzureOpenAIConfig };
