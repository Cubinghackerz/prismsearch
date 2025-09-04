import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Get all available Gemini API keys
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const FALLBACK_GEMINI_API_KEY_1 = Deno.env.get('FALLBACK_GEMINI_API_KEY_1');
const FALLBACK_GEMINI_API_KEY_2 = Deno.env.get('FALLBACK_GEMINI_API_KEY_2');
const FALLBACK_GEMINI_API_KEY_3 = Deno.env.get('FALLBACK_GEMINI_API_KEY_3');
const FALLBACK_GEMINI_API_KEY_4 = Deno.env.get('FALLBACK_GEMINI_API_KEY_4');
const FALLBACK_GEMINI_API_KEY_5 = Deno.env.get('FALLBACK_GEMINI_API_KEY_5');

// Create array of all available Gemini API keys
const GEMINI_API_KEYS = [
  GEMINI_API_KEY,
  FALLBACK_GEMINI_API_KEY_1,
  FALLBACK_GEMINI_API_KEY_2,
  FALLBACK_GEMINI_API_KEY_3,
  FALLBACK_GEMINI_API_KEY_4,
  FALLBACK_GEMINI_API_KEY_5,
].filter(Boolean); // Remove any undefined keys

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem) {
      throw new Error('Problem is required');
    }

    console.log('Solving math problem:', problem);

    const mathPrompt = `You are Gemini 2.5 Pro, an advanced mathematical reasoning AI model. Given the following mathematical problem or expression, provide a comprehensive solution with deep analytical thinking.

Instructions:
1. Think step-by-step through the problem with detailed reasoning
2. Identify the type of mathematical problem (algebra, calculus, geometry, statistics, etc.)
3. Provide step-by-step solution with clear explanations
4. Show all intermediate steps and reasoning processes
5. If it's an equation, solve for the variable(s) systematically
6. If it's calculus, show the integration/differentiation process with justification
7. If it's a word problem, set up the mathematical model first and explain your approach
8. Include any relevant mathematical concepts, theorems, or principles used
9. Format mathematical expressions clearly using standard notation
10. Provide the final answer clearly labeled with verification if possible
11. Use analytical thinking to explore alternative approaches when applicable

Mathematical Problem: ${problem}

Please provide a detailed, step-by-step solution with deep mathematical reasoning:`;

    if (GEMINI_API_KEYS.length === 0) {
      throw new Error('No Gemini API keys available');
    }

    const solution = await sendGeminiPrompt(mathPrompt);

    console.log('Math solution generated successfully with Gemini 2.5 Pro');

    return new Response(
      JSON.stringify({ solution }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in math assistant:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to solve mathematical problem'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function sendGeminiPrompt(promptText: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = GEMINI_API_KEYS.length;
  let currentGeminiKeyIndex = 0;

  while (attempts < maxAttempts) {
    const currentApiKey = GEMINI_API_KEYS[currentGeminiKeyIndex];
    
    try {
      console.log(`Attempting Gemini 2.5 Pro request with key index ${currentGeminiKeyIndex} (attempt ${attempts + 1})`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${currentApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error with key index ${currentGeminiKeyIndex}:`, response.status, errorText);
        
        // Move to next API key if available
        if (attempts < maxAttempts - 1) {
          currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
          attempts++;
          console.log(`Trying next Gemini API key (index ${currentGeminiKeyIndex})`);
          continue;
        }
        
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Gemini API');
      }

      if (currentGeminiKeyIndex > 0) {
        console.log(`Successfully used fallback Gemini API key (index ${currentGeminiKeyIndex})`);
      }

      return content.trim();
    } catch (error) {
      console.error(`Gemini API attempt ${attempts + 1} with key index ${currentGeminiKeyIndex} failed:`, error);
      
      // Move to next API key if available
      if (attempts < maxAttempts - 1) {
        currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
        attempts++;
        console.log(`Trying next Gemini API key (index ${currentGeminiKeyIndex})`);
        continue;
      }
      
      // If we've exhausted all attempts, throw the error
      throw error;
    }
  }

  throw new Error('All Gemini API keys failed');
}