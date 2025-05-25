
import { getAzureOpenAI } from '../lib/azure-openai';
import type { ChatMessage as AzureChatMessage } from '../types/azure-openai';

/**
 * Interface for the messages sent to the Azure OpenAI API
 * @deprecated Use ChatMessage from types/azure-openai.ts instead
 */
export interface LegacyMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use getAzureOpenAI from lib/azure-openai.ts instead
 */
export async function generateTextWithAzureOpenAI(
  messages: LegacyMessage[], 
  model: 'o4-mini' = 'o4-mini'
): Promise<string> {
  try {
    console.log(`Legacy function called - consider migrating to new Azure OpenAI service`);
    
    // Get the API key from environment or Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    // Call the Supabase Edge Function for backwards compatibility
    const response = await fetch(`${supabaseUrl}/functions/v1/azure-openai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({ 
        messages,
        model, 
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Legacy streaming function for backwards compatibility
 * @deprecated Use the new AzureOpenAIService class instead
 */
export async function generateStreamingTextWithAzureOpenAI(
  messages: LegacyMessage[],
  onChunk: (chunk: string) => void,
  model: 'o4-mini' = 'o4-mini'
): Promise<void> {
  try {
    console.log(`Legacy streaming function called - consider migrating to new service`);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    const response = await fetch(`${supabaseUrl}/functions/v1/azure-openai-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({ 
        messages,
        model,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI Streaming Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Azure OpenAI Streaming Error:', error);
    throw new Error(`Failed to generate streaming text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Example usage of the new Azure OpenAI service
 */
export async function exampleNewAzureOpenAIUsage(): Promise<string> {
  const apiKey = 'your-api-key'; // Get from secure source
  const azureService = getAzureOpenAI(apiKey);
  
  const messages: AzureChatMessage[] = [
    { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
    { role: 'user', content: 'I am going to Paris, what should I see?' }
  ];
  
  try {
    const response = await azureService.chat(messages);
    console.log('New Azure OpenAI Response:', response.response);
    return response.response;
  } catch (error) {
    console.error('Error in new service usage:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Re-export types for backwards compatibility
export type { LegacyMessage };
