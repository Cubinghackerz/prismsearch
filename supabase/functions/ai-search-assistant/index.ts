
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Anthropic } from "npm:@anthropic-ai/sdk@0.18.0"
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    let response = ""

    try {
      // Try Anthropic first
      const anthropic = new Anthropic({
        apiKey: Deno.env.get('ANTHROPIC_API_KEY')!
      })

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Provide a brief, helpful reaction to this search query: "${query}". Keep it conversational and under 2 sentences.`
        }],
      })

      response = message.content[0].text
    } catch (anthropicError) {
      console.error('Anthropic error:', anthropicError)
      
      // Try OpenAI as first fallback
      try {
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY')!
        })

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You provide brief, helpful reactions to search queries. Keep responses conversational and under 2 sentences.'
            },
            {
              role: 'user',
              content: query
            }
          ]
        })

        response = completion.choices[0].message.content || ""
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError)

        // Try Gemini as second fallback
        try {
          const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          
          const result = await model.generateContent(
            `Provide a brief, helpful reaction to this search query: "${query}". Keep it conversational and under 2 sentences.`
          );
          const geminiResponse = result.response.text();
          response = geminiResponse;
        } catch (geminiError) {
          console.error('Gemini error:', geminiError)
          throw new Error('All AI services failed to respond')
        }
      }
    }

    return new Response(
      JSON.stringify({ response }),
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
