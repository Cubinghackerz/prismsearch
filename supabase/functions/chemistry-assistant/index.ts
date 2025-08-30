
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

    console.log('Solving chemistry problem:', problem);

    const chemistryPrompt = `You are Qwen3-30B-A3B (MoE), an advanced chemistry reasoning AI model. Given the following chemistry problem, provide a comprehensive solution with deep analytical thinking.

Instructions:
1. Identify the type of chemistry problem (stoichiometry, equilibrium, kinetics, thermodynamics, etc.)
2. List all given information and what needs to be found
3. Write balanced chemical equations when applicable
4. Apply relevant chemistry principles and laws systematically
5. Show all calculations step-by-step with proper units and significant figures
6. Include molecular structures or reaction mechanisms when helpful
7. Use proper chemical notation and formulas
8. Explain the chemical reasoning behind each step
9. Verify the answer makes chemical sense
10. Discuss alternative approaches if applicable

Chemistry Problem: ${problem}

Please provide a detailed, step-by-step solution with clear chemistry reasoning:`;

    // Try local Qwen model first
    let response;
    try {
      console.log('Attempting to use local Qwen3-30B-A3B (MoE) model...');
      response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-30b-a3b-moe',
          prompt: chemistryPrompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 8192
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const solution = data.response;
        
        if (solution) {
          console.log('Chemistry solution generated successfully with local Qwen model');
          return new Response(
            JSON.stringify({ solution }),
            { 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
      }
    } catch (localError) {
      console.log('Local Qwen model not available, falling back to Groq:', localError.message);
    }

    // Fallback to Groq API
    if (!GROQ_API_KEY) {
      throw new Error('Local Qwen model unavailable and Groq API key not configured');
    }

    console.log('Using Groq API as fallback...');
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced chemistry reasoning model. Focus on providing thorough chemistry solutions with step-by-step reasoning, balanced equations, and clear explanations of chemical concepts.'
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
      console.error('API error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from API');
    }

    console.log('Chemistry solution generated successfully');

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
