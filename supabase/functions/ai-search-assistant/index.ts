
// Import required Deno modules
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Process request with the specified AI model
async function processRequest(model: string, query: string, chatId?: string, chatHistory?: any[]) {
  console.log(`Processing ${model} request for chat ${chatId}`);
  
  switch (model) {
    case 'mistral':
      return processMistralRequest(query, chatHistory);
    case 'mistral-medium-3':
      return processMistralLargeRequest(query, chatHistory);
    case 'groq':
      return processGroqRequest(query, chatHistory);
    case 'gemini':
      return processGeminiRequest(query, chatHistory);
    case 'groq-qwen-qwq':
      return processGroqQwenRequest(query, chatHistory);
    case 'groq-llama4-scout':
      return processGroqLlama4ScoutRequest(query, chatHistory);
    default:
      return processMistralRequest(query, chatHistory); // Default to Mistral
  }
}

// Process request with Mistral API
async function processMistralRequest(query: string, chatHistory?: any[]) {
  const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
  
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key is not set');
  }
  
  const messages = formatChatHistory(chatHistory, query);
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-medium',
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Process request with Mistral Large API (using existing Mistral API key)
async function processMistralLargeRequest(query: string, chatHistory?: any[]) {
  const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
  
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key is not set');
  }
  
  const messages = formatChatHistory(chatHistory, query);
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral Large API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Process request with Groq API (Llama-3-70B)
async function processGroqRequest(query: string, chatHistory?: any[]) {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not set');
  }
  
  const messages = formatChatHistory(chatHistory, query);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Process request with Groq API (Qwen-QwQ using Groq API key)
async function processGroqQwenRequest(query: string, chatHistory?: any[]) {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not set');
  }
  
  const messages = formatChatHistory(chatHistory, query);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-qwq-32b',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq Qwen API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Process request with Groq API (Llama 4 Scout using Groq API key)
async function processGroqLlama4ScoutRequest(query: string, chatHistory?: any[]) {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not set');
  }
  
  const messages = formatChatHistory(chatHistory, query);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-specdec',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq Llama API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Process request with Gemini API
async function processGeminiRequest(query: string, chatHistory?: any[]) {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not set');
  }
  
  // Format messages for Gemini API
  const messages = [];
  
  // Add system message
  messages.push({
    role: 'user',
    parts: [{ text: 'You are Prism, a helpful AI assistant. You provide clear, concise and accurate answers.' }]
  });
  
  messages.push({
    role: 'model',
    parts: [{ text: 'I am Prism, a helpful AI assistant. I provide clear, concise, and accurate answers. How can I help you today?' }]
  });
  
  // Add chat history
  if (chatHistory && chatHistory.length > 0) {
    // Limit to last 10 messages for context
    const recentHistory = chatHistory.slice(-10);
    
    for (const msg of recentHistory) {
      if (msg.content && msg.content.trim()) {
        const role = msg.isUser ? 'user' : 'model';
        messages.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      }
    }
  }
  
  // Add the current query
  messages.push({
    role: 'user',
    parts: [{ text: query }]
  });
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || 
        !data.candidates[0].content || !data.candidates[0].content.parts || 
        data.candidates[0].content.parts.length === 0) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    // Add a typing delay to simulate a more natural response
    const generatedText = data.candidates[0].content.parts[0].text;
    const typingTime = Math.min(2000, generatedText.length * 10);
    console.log(`Response generated, adding ${typingTime}ms typing delay\n`);
    
    // Add artificial delay to simulate typing
    await new Promise(resolve => setTimeout(resolve, typingTime));
    
    return generatedText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

// Helper function to format chat history for OpenAI-compatible APIs
function formatChatHistory(chatHistory: any[] | undefined, currentQuery: string) {
  const messages = [];
  
  // Add system message
  messages.push({
    role: 'system',
    content: 'You are Prism, a helpful AI assistant. You provide clear, concise and accurate answers.'
  });
  
  // Add chat history
  if (chatHistory && chatHistory.length > 0) {
    // Limit to last 10 messages for context
    const recentHistory = chatHistory.slice(-10);
    
    for (const msg of recentHistory) {
      if (msg.content && msg.content.trim()) {
        const role = msg.isUser ? 'user' : 'assistant';
        messages.push({
          role: role,
          content: msg.content
        });
      }
    }
  }
  
  // Add the current query
  messages.push({
    role: 'user',
    content: currentQuery
  });
  
  return messages;
}

// Main request handler
serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { query, chatId, chatHistory, model = 'mistral' } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the request with the specified model
    const response = await processRequest(model, query, chatId, chatHistory);
    
    // Return the generated response
    return new Response(
      JSON.stringify({ response }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
