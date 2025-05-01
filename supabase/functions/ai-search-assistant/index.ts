
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Anthropic } from "npm:@anthropic-ai/sdk@0.18.0"
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Update Gemini configuration to use the 2.0-flash model
const genAI = new GoogleGenerativeAI('AIzaSyAD2-PwoGFnlgzYIBI63s0Rzwe8Mugi09E');
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
    let usageRemaining = null

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
    
    // Create messages array for the chosen model
    const formattedChatHistory = existingChatHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }))

    if (model === 'gemini') {
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
        response = "I apologize, but I encountered an error with Gemini. Please try again or choose a different AI model.";
      }
    } else if (model === 'claude') {
      try {
        const anthropic = new Anthropic({
          apiKey: Deno.env.get('ANTHROPIC_API_KEY')!
        })

        // Create messages for chat mode
        const messages = formattedChatHistory.concat([{ role: 'user', content: query }])

        const message = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307', // Updated to correct Claude model name
          max_tokens: 1000,
          temperature: 0.7,
          messages: messages,
        })

        response = message.content[0].text
        usageRemaining = 10 // Unlimited for a limited time
      } catch (anthropicError) {
        console.error('Anthropic error:', anthropicError)
        // Provide a helpful fallback message
        response = "I'm Claude, but I'm having trouble connecting right now. Please try again or select a different AI model."
        usageRemaining = 10
      }
    } else if (model === 'gpt') {
      try {
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY')!
        })

        // Create system message based on context
        const systemMessage = {
          role: 'system',
          content: 'You are ChatGPT 4o, a helpful and knowledgeable AI assistant. Your responses should be informative, concise, and conversational. Always aim to provide accurate information while being engaging and friendly. If you are unsure about something, be honest about the limitations of your knowledge.'
        }

        const messages = [systemMessage, ...formattedChatHistory, { role: 'user', content: query }]

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        })

        response = completion.choices[0].message.content || ""
        usageRemaining = 10 // Unlimited for a limited time
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError)
        // Provide a helpful fallback message
        response = "I'm ChatGPT, but I'm having trouble connecting right now. Please try again or select a different AI model."
        usageRemaining = 10
      }
    } else {
      // Default fallback
      response = "Sorry, I don't recognize the selected AI model. Please try a different model.";
    }

    return new Response(
      JSON.stringify({ response, usageRemaining }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Sorry, I encountered an error. Please try again or select a different AI model."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
