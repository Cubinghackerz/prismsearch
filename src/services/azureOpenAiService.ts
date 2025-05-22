
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
  modelName: 'gpt-4.1-nano',
  deploymentName: 'gpt-4.1-nano',
  apiVersion: '2024-04-01-preview',
};

/**
 * Creates an instance of the Azure OpenAI client
 * @returns OpenAI client configured for Azure
 */
const createAzureOpenAIClient = () => {
  const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('AZURE_OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey,
    baseURL: `${AZURE_OPENAI_CONFIG.endpoint}openai/deployments/${AZURE_OPENAI_CONFIG.deploymentName}`,
    defaultQuery: { 'api-version': AZURE_OPENAI_CONFIG.apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  });
};

/**
 * Sends a request to Azure OpenAI for text generation
 * @param messages Array of message objects to send to the API
 * @returns The generated response text
 */
export async function generateTextWithAzureOpenAI(messages: Message[]): Promise<string> {
  try {
    // Create the Azure OpenAI client
    const client = createAzureOpenAIClient();
    
    // Make the completion request
    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_CONFIG.modelName,
      messages: messages,
    });
    
    // Check for errors in the response
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('Invalid response received from Azure OpenAI API');
    }
    
    // Return the generated text
    return response.choices[0].message.content || '';
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
