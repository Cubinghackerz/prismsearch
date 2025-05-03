
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get API keys from environment variables for better security
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') || '';
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// In-memory store for chat history
const chatHistories = new Map();

// Helper function to create a formatted prompt that includes attachment info
function formatAttachmentsForPrompt(attachments) {
  if (!attachments || attachments.length === 0) return '';
  
  return attachments.map(att => {
    if (att.type === 'image') {
      return `[Attached image: ${att.name}] The user has attached an image file named "${att.name}". This is a visual element to consider in your response.`;
    } else {
      return `[Attached file: ${att.name}] The user has attached a file named "${att.name}". This is additional context to consider in your response.`;
    }
  }).join("\n\n");
}

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
    const formattedChatHistory = existingChatHistory.map(msg => {
      // Process the message content with any attachments
      let content = msg.content;
      
      // Add attachment descriptions to the content if they exist
      if (msg.attachments && msg.attachments.length > 0) {
        const attachmentsText = formatAttachmentsForPrompt(msg.attachments);
        content = `${content}\n\n${attachmentsText}`;
      }
      
      return {
        role: msg.isUser ? 'user' : 'assistant',
        content: content
      };
    });

    // Format any attachments in the current query
    let fullQuery = query;
    const attachmentsInfo = req.attachments ? formatAttachmentsForPrompt(req.attachments) : '';
    if (attachmentsInfo) {
      fullQuery = `${query}\n\n${attachmentsInfo}`;
    }

    // Use the appropriate model based on the request
    if (model === 'mistral') {
      try {
        if (!MISTRAL_API_KEY) {
          throw new Error("Mistral API key is not configured");
        }

        const messages = [
          ...formattedChatHistory,
          { role: 'user', content: fullQuery }
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
    } else if (model === 'groq') {
      try {
        if (!GROQ_API_KEY) {
          throw new Error("Groq API key is not configured");
        }

        const messages = [
          ...formattedChatHistory,
          { role: 'user', content: fullQuery }
        ];

        const completion = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7,
          })
        });

        const data = await completion.json();
        
        if (data.error) {
          console.error('Groq API error:', data.error);
          throw new Error(data.error.message || 'Groq API error');
        }
        
        response = data.choices[0].message.content || 
                  "I apologize, but I couldn't generate a response. Please try again.";
      } catch (error) {
        console.error('Groq error:', error);
        response = "I apologize, but I encountered an error with the Groq service. Please check if the API key is valid and configured properly.";
      }
    } else {
      // Use Gemini as fallback
      try {
        // Process the chat history for Gemini
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

        const result = await chat.sendMessage(fullQuery);
        const responseText = result.response.text();
        response = responseText;
      } catch (error) {
        console.error('Gemini error:', error);
        response = "I apologize, but I encountered an error with the Gemini service. Please try again.";
      }
    }

    // Simulate typing delay (500-2000ms depending on response length)
    const typingDelay = Math.min(Math.max(response.length * 10, 500), 2000);
    console.log(`Response generated, adding ${typingDelay}ms typing delay`);
    
    // Use setTimeout to delay the response
    await new Promise(resolve => setTimeout(resolve, typingDelay));

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
