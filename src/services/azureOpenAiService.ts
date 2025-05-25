
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
  endpoint: 'https://punar-maz8m55t-eastus2.cognitiveservices.azure.com/',
  models: {
    'o4-mini': {
      modelName: 'o4-mini',
      deploymentName: 'o4-mini',
      apiVersion: '2025-01-01-preview',
    }
  }
};

/**
 * Sends a request to Azure OpenAI for text generation via the Supabase Edge Function
 * @param messages Array of message objects to send to the API
 * @param model Optional model to use. Defaults to o4-mini
 * @returns The generated response text
 */
export async function generateTextWithAzureOpenAI(
  messages: Message[], 
  model: 'o4-mini' = 'o4-mini'
): Promise<string> {
  try {
    console.log(`Calling Azure OpenAI edge function with model: ${model}`);
    console.log(`Messages: ${JSON.stringify(messages.slice(-1))}`);
    
    // Get the Supabase URL from the environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    // Call the Supabase Edge Function that handles Azure OpenAI communication
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
      let errorMessage = `Azure OpenAI API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `Azure OpenAI API Error: ${errorData.error || response.statusText}`;
      } catch (e) {
        console.warn('Could not parse error response as JSON:', e);
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid response content type: ${contentType}`);
    }

    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from API');
    }

    try {
      const data = JSON.parse(responseText);
      return data.response || '';
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error(`Failed to parse API response: ${e.message}`);
    }
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    throw new Error(`Failed to generate text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Sends a streaming request to Azure OpenAI
 * @param messages Array of message objects to send to the API
 * @param onChunk Callback function to handle streaming chunks
 * @param model Optional model to use. Defaults to o4-mini
 */
export async function generateStreamingTextWithAzureOpenAI(
  messages: Message[],
  onChunk: (chunk: string) => void,
  model: 'o4-mini' = 'o4-mini'
): Promise<void> {
  try {
    console.log(`Calling Azure OpenAI streaming with model: ${model}`);
    
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
            // Skip invalid JSON chunks
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Azure OpenAI Streaming Error:', error);
    throw new Error(`Failed to generate streaming text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Example usage of the Azure OpenAI service
 */
export async function exampleAzureOpenAIUsage(): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful search assistant for PrismSearch.' },
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
