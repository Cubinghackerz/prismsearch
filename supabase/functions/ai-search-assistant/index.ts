
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get API key from environment variable for better security
const API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAD2-PwoGFnlgzYIBI63s0Rzwe8Mugi09E';
const genAI = new GoogleGenerativeAI(API_KEY);
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
    
    // Create messages array for the Gemini model
    const formattedChatHistory = existingChatHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }))

    // All models now use Gemini
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
