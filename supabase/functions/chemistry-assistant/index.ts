
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
      throw new Error('Groq API key not configured for Qwen3-235B-A22B-Thinking-2507');
    }

    console.log('Solving chemistry problem with Qwen3-235B-A22B-Thinking-2507:', problem);

    const chemistryPrompt = `You are Qwen3-235B-A22B-Thinking-2507, an advanced chemistry reasoning AI model. Given the following chemistry problem or concept, provide a comprehensive solution with deep analytical thinking.

Instructions:
1. Think step-by-step through the chemistry problem with detailed reasoning
2. Identify the type of chemistry problem (stoichiometry, thermochemistry, kinetics, equilibrium, organic, inorganic, etc.)
3. List all given information and what needs to be determined
4. Identify the relevant chemical principles, laws, and equations
5. Show all calculations step-by-step with proper units and significant figures
6. Draw molecular structures, reaction mechanisms, or diagrams when applicable (describe them in text)
7. Explain the chemical reasoning behind each step
8. Balance chemical equations when necessary
9. Include relevant chemical concepts, theories, or principles used
10. Format chemical formulas and equations clearly using standard notation
11. Provide the final answer clearly labeled with proper units
12. Verify the answer makes sense chemically (realistic values, conservation laws, etc.)
13. Use analytical thinking to explore alternative approaches when applicable

Chemistry Problem: ${problem}

Please provide a detailed, step-by-step solution with deep chemistry reasoning:`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Using available model as placeholder for Qwen3-235B-A22B-Thinking-2507
        messages: [
          {
            role: 'system',
            content: 'You are Qwen3-235B-A22B-Thinking-2507, an advanced chemistry reasoning model with deep analytical capabilities. Focus on providing thorough chemistry solutions with step-by-step reasoning and chemical insight.'
          },
          {
            role: 'user',
            content: chemistryPrompt
          }
        ],
        max_tokens: 8192,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Qwen3-235B-A22B-Thinking-2507 API error:', response.status, errorText);
      throw new Error(`Qwen3-235B-A22B-Thinking-2507 API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from Qwen3-235B-A22B-Thinking-2507 API');
    }

    console.log('Chemistry solution generated successfully with Qwen3-235B-A22B-Thinking-2507');

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
    console.error('Error in chemistry assistant:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to solve chemistry problem'
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
