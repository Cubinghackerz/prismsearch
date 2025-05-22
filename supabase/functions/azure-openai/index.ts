
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@4.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Azure OpenAI configuration
const AZURE_OPENAI_CONFIG = {
  endpoint: 'https://prismsearchai.cognitiveservices.azure.com/',
  modelName: 'gpt-4.1-nano',
  deploymentName: 'gpt-4.1-nano',
  apiVersion: '2024-04-01-preview',
};

// Create Azure OpenAI client
function createAzureOpenAIClient() {
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
}

// Generate text using Azure OpenAI
async function generateText(messages: any[]) {
  try {
    const client = createAzureOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: AZURE_OPENAI_CONFIG.modelName,
      messages: messages,
    });
    
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('Invalid response from Azure OpenAI');
    }
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Azure OpenAI API Error:', error);
    throw new Error(`Failed to generate text: ${error.message || 'Unknown error'}`);
  }
}

// Serve the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default example if no messages provided
    const messagesToSend = messages.length > 0 ? messages : [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'I am going to Paris, what should I see?' }
    ];
    
    console.log('Sending request to Azure OpenAI:', messagesToSend);
    
    const generatedText = await generateText(messagesToSend);
    
    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
