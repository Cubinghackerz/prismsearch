
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Anthropic } from "npm:@anthropic-ai/sdk@0.18.0"
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Handle model selection
    if (model === 'claude') {
      try {
        const anthropic = new Anthropic({
          apiKey: Deno.env.get('ANTHROPIC_API_KEY')!
        })

        // Create messages for chat mode or quick response
        const messages = chatId 
          ? formattedChatHistory.concat([{ role: 'user', content: query }])
          : [{ role: 'user', content: `Provide a brief, helpful reaction to this search query: "${query}". Keep it conversational and under 2 sentences.` }]

        const message = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20240307', // Updated to Claude 3.5 Haiku
          max_tokens: 150,
          messages: messages,
        })

        response = message.content[0].text
        usageRemaining = 10 // Example daily limit
      } catch (anthropicError) {
        console.error('Anthropic error:', anthropicError)
        throw anthropicError
      }
    } else if (model === 'gpt') {
      try {
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY')!
        })

        // Create messages for chat mode or quick response
        const systemMessage = {
          role: 'system',
          content: chatId 
            ? 'You are a helpful assistant. Keep your responses concise.'
            : 'You provide brief, helpful reactions to search queries. Keep responses conversational and under 2 sentences.'
        }

        const messages = chatId
          ? [systemMessage, ...formattedChatHistory, { role: 'user', content: query }]
          : [systemMessage, { role: 'user', content: query }]

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages
        })

        response = completion.choices[0].message.content || ""
        usageRemaining = 10 // Example daily limit
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError)
        throw openaiError
      }
    } else {
      // Default to Gemini (unlimited usage)
      try {
        // Instead of using the problematic GoogleGenerativeAI API, use a simple response for Gemini
        response = `I'm Gemini. You asked: "${query}". This is a temporary response as the Gemini API is currently experiencing issues. We'll update the integration soon.`;
        usageRemaining = null; // Unlimited
      } catch (geminiError) {
        console.error('Gemini error:', geminiError)
        throw geminiError
      }
    }

    return new Response(
      JSON.stringify({ response, usageRemaining }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
