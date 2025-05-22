
import OpenAI from 'openai';

/**
 * Interface for the messages sent to the Azure OpenAI API
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Configuration for Azure OpenAI
 */
const AZURE_OPENAI_CONFIG = {
  endpoint: 'https://prismsearchai.cognitiveservices.azure.com/',
  models: {
    'gpt-4.1-nano': {
      modelName: 'gpt-4.1-nano',
      deploymentName: 'gpt-4.1-nano',
      apiVersion: '2024-04-01-preview',
    },
    'o4-mini': {
      modelName: 'o4-mini',
      deploymentName: 'o4-mini',
      apiVersion: '2024-04-01-preview',
    }
  }
};

/**
 * Sends a request to Azure OpenAI for text generation via the Supabase Edge Function
 * @param messages Array of message objects to send to the API
 * @param model Optional model to use. Defaults to gpt-4.1-nano
 * @returns The generated response text
 */
export async function generateTextWithAzureOpenAI(
  messages: Message[], 
  model: 'gpt-4.1-nano' | 'o4-mini' = 'gpt-4.1-nano'
): Promise<string> {
  try {
    // Call the Supabase Edge Function that handles Azure OpenAI communication
    const response = await fetch('/api/azure-openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages,
        model, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Azure OpenAI API Error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    throw new Error(`Failed to generate text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Example usage of the Azure OpenAI service
 */
export async function exampleAzureOpenAIUsage(): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'I am going to Paris, what should I see?' }
  ];
  
  try {
    const response = await generateTextWithAzureOpenAI(messages);
    console.log('Azure OpenAI Response:', response);
    return response;
  } catch (error) {
    console.error('Error in example usage:', error);
    return `Error: ${error.message}`;
  }
}
