
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem) {
      throw new Error('Problem is required');
    }

    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    console.log('Solving math problem:', problem);

    const mathPrompt = `You are an advanced mathematical reasoning AI model. Given the following mathematical problem or expression, provide a comprehensive solution with detailed analytical thinking.

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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Using available working model
        messages: [
          {
            role: 'system',
            content: 'You are an advanced mathematical reasoning model with deep analytical capabilities. Focus on providing thorough mathematical solutions with step-by-step reasoning.'
          },
          {
            role: 'user',
            content: mathPrompt
          }
        ],
        max_tokens: 8192,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Math API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from Math API');
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
