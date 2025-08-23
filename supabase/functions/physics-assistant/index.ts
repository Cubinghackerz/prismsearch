
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

    console.log('Solving physics problem:', problem);

    const physicsPrompt = `You are Qwen3-235B-A22B-Thinking-2507, an advanced physics reasoning AI model. Given the following physics problem, provide a comprehensive solution with deep analytical thinking.

Instructions:
1. Identify the physics concepts, laws, and principles involved
2. List all given information and what needs to be found
3. Draw diagrams or describe the physical setup when helpful
4. Apply relevant physics equations and formulas systematically
5. Show all calculations step-by-step with proper units
6. Explain the physical reasoning behind each step
7. Include relevant constants (g = 9.81 m/s², c = 3×10⁸ m/s, etc.)
8. Verify the answer makes physical sense
9. Discuss alternative approaches if applicable
10. Format equations clearly and use proper physics notation

Physics Problem: ${problem}

Please provide a detailed, step-by-step solution with clear physics reasoning:`;

    // Try local Qwen model first
    let response;
    try {
      console.log('Attempting to use local Qwen3-235B-A22B-Thinking-2507 model...');
      response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-235b-a22b-thinking-2507',
          prompt: physicsPrompt,
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
          console.log('Physics solution generated successfully with local Qwen model');
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
            content: 'You are an advanced physics reasoning model. Focus on providing thorough physics solutions with step-by-step reasoning, proper equations, and clear explanations of physical concepts.'
          },
          {
            role: 'user',
            content: physicsPrompt
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

    console.log('Physics solution generated successfully');

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
    console.error('Error in physics assistant:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to solve physics problem'
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
