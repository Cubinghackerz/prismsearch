
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get API keys from environment variables for better security
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAD2-PwoGFnlgzYIBI63s0Rzwe8Mugi09E';
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') || '';
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY') || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// In-memory store for chat history
const chatHistories = new Map();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, chatId, chatHistory, model } = await req.json()
    let response = ""

    if (!query) {
      throw new Error("Missing query parameter")
    }

    console.log(`Processing ${model} request for chat ${chatId}`)

    // If we have a chatId and chatHistory, store it for future use
    if (chatId && chatHistory) {
      chatHistories.set(chatId, chatHistory)
    }

    // Get chat history if it exists
    const existingChatHistory = chatId ? (chatHistories.get(chatId) || []) : []
    
    // Create messages array for the model
    const formattedChatHistory = existingChatHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }))

    // Use the appropriate model based on the request
    if (model === 'mistral') {
      try {
        if (!MISTRAL_API_KEY) {
          throw new Error("Mistral API key is not configured");
        }

        const messages = [
          ...formattedChatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: query }
        ];

        const completion = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: "mistral-medium",
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7,
          })
        });

        const data = await completion.json();
        
        if (data.error) {
          console.error('Mistral API error:', data.error);
          throw new Error(data.error.message || 'Mistral API error');
        }
        
        response = data.choices[0].message.content || 
                  "I apologize, but I couldn't generate a response. Please try again.";
      } catch (error) {
        console.error('Mistral error:', error);
        response = "I apologize, but I encountered an error with the Mistral service. Please check if the API key is valid and configured properly.";
      }
    } else if (model === 'deepseek') {
      try {
        if (!DEEPSEEK_API_KEY) {
          throw new Error("DeepSeek API key is not configured");
        }

        const messages = [
          ...formattedChatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: query }
        ];

        const completion = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-r1-distill-llama-70b",
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7,
          })
        });

        const data = await completion.json();
        
        if (data.error) {
          console.error('DeepSeek API error:', data.error);
          throw new Error(data.error.message || 'DeepSeek API error');
        }
        
        response = data.choices[0].message.content || 
                  "I apologize, but I couldn't generate a response. Please try again.";
      } catch (error) {
        console.error('DeepSeek error:', error);
        response = "I apologize, but I encountered an error with the DeepSeek service. Please check if the API key is valid and configured properly.";
      }
    } else {
      // Use Gemini as fallback
      try {
        const chat = geminiModel.startChat({
          history: formattedChatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          }
        });

        const result = await chat.sendMessage(query);
        const responseText = result.response.text();
        response = responseText;
      } catch (error) {
        console.error('Gemini error:', error);
        response = "I apologize, but I encountered an error. Please try again.";
      }
    }

    return new Response(
      JSON.stringify({ response, usageRemaining: null }), // All models are now unlimited
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Sorry, I encountered an error. Please try again."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
