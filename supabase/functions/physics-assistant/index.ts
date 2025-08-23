
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const LOCAL_QWEN_URL = Deno.env.get('LOCAL_QWEN_URL') || 'http://localhost:11434'; // Default to Ollama port

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem) {
      throw new Error('Problem is required');
    }

    console.log('Solving physics problem with local Qwen3:', problem);

    const physicsPrompt = `You are Qwen3-235B-A22B-Thinking-2507, an advanced physics problem-solving AI with deep understanding of all physics domains. Given the following physics problem, provide a comprehensive solution with detailed analytical thinking.

Instructions:
1. Identify the physics domain (mechanics, thermodynamics, electromagnetism, quantum physics, etc.)
2. List all given information and what needs to be found
3. Identify the relevant physics principles, laws, and equations
4. Show step-by-step solution with clear explanations
5. Include proper units throughout the calculation
6. Explain the physical meaning of each step
7. Provide diagrams or descriptions where helpful
8. Show dimensional analysis to verify answers
9. Discuss the physical interpretation of results
10. Include any assumptions made and their validity
11. Format equations and symbols clearly

Physics Problem: ${problem}

Please provide a detailed, step-by-step solution with physical reasoning:`;

    // Try to connect to local Qwen3 model first
    try {
      const localResponse = await fetch(`${LOCAL_QWEN_URL}/api/generate`, {
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

      if (localResponse.ok) {
        const localData = await localResponse.json();
        const solution = localData.response;
        
        if (solution) {
          console.log('Physics solution generated successfully with local Qwen3');
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
      console.warn('Local Qwen3 model not available, falling back to Groq:', localError);
    }

    // Fallback to Groq if local model is not available
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('Neither local Qwen3 model nor Groq API key is configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            content: 'You are an advanced physics reasoning model with deep understanding of physical principles. Focus on providing thorough physics solutions with step-by-step reasoning and proper units.'
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
      console.error('Physics API error:', response.status, errorText);
      throw new Error(`Physics API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from Physics API');
    }

    console.log('Physics solution generated successfully with fallback model');

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
