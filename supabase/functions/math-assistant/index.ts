
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem) {
      throw new Error('Problem is required');
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Solving math problem:', problem);

    const mathPrompt = `You are an expert mathematician and math tutor. Given the following mathematical problem or expression, provide a comprehensive solution.

Instructions:
1. First, identify the type of mathematical problem (algebra, calculus, geometry, statistics, etc.)
2. Provide step-by-step solution with clear explanations
3. Show all intermediate steps and reasoning
4. If it's an equation, solve for the variable(s)
5. If it's calculus, show the integration/differentiation process
6. If it's a word problem, set up the mathematical model first
7. Include any relevant mathematical concepts or theorems used
8. Format mathematical expressions clearly using standard notation
9. Provide the final answer clearly labeled

Mathematical Problem: ${problem}

Please provide a detailed, step-by-step solution:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: mathPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!solution) {
      throw new Error('No solution received from Gemini API');
    }

    console.log('Math solution generated successfully');

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
