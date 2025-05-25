
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@4.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Azure OpenAI configuration
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

// Create Azure OpenAI client
function createAzureOpenAIClient(model = 'gpt-4.1-nano') {
  const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('AZURE_OPENAI_API_KEY environment variable is not set');
  }

  const modelConfig = AZURE_OPENAI_CONFIG.models[model] || AZURE_OPENAI_CONFIG.models['gpt-4.1-nano'];

  return new OpenAI({
    apiKey,
    baseURL: `${AZURE_OPENAI_CONFIG.endpoint}openai/deployments/${modelConfig.deploymentName}`,
    defaultQuery: { 'api-version': modelConfig.apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  });
}

// Generate text using Azure OpenAI
async function generateText(messages: any[], model = 'gpt-4.1-nano') {
  try {
    const client = createAzureOpenAIClient(model);
    const modelConfig = AZURE_OPENAI_CONFIG.models[model] || AZURE_OPENAI_CONFIG.models['gpt-4.1-nano'];
    
    console.log(`Making request to Azure OpenAI (${model}): ${modelConfig.deploymentName}`);
    
    const response = await client.chat.completions.create({
      model: modelConfig.modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
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
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { messages, model = 'gpt-4.1-nano' } = requestBody;
    
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
    
    console.log(`Sending request to Azure OpenAI (${model})`, {
      messageCount: messagesToSend.length,
      firstUserMessage: messagesToSend.find(m => m.role === 'user')?.content?.substring(0, 50) + '...',
    });
    
    const generatedText = await generateText(messagesToSend, model);
    console.log('Successfully generated response:', generatedText.substring(0, 50) + '...');
    
    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Azure OpenAI edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
