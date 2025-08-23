
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

    console.log('Solving chemistry problem:', problem);

    const chemistryPrompt = `You are an advanced chemistry problem-solving AI with deep understanding of all chemistry domains. Given the following chemistry problem, provide a comprehensive solution with detailed analytical thinking.

Instructions:
1. Identify the chemistry domain (organic, inorganic, physical, analytical, biochemistry, etc.)
2. List all given information and what needs to be found
3. Identify relevant chemical principles, laws, and equations
4. Show step-by-step solution with clear explanations
5. Include proper chemical formulas, equations, and nomenclature
6. Show stoichiometric calculations where applicable
7. Include units and significant figures throughout
8. Explain the chemical reasoning behind each step
9. Draw or describe molecular structures when relevant
10. Discuss reaction mechanisms if applicable
11. Include safety considerations where appropriate
12. Format chemical equations and structures clearly

Chemistry Problem: ${problem}

Please provide a detailed, step-by-step solution with chemical reasoning:`;

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
            content: 'You are an advanced chemistry reasoning model with deep understanding of chemical principles. Focus on providing thorough chemistry solutions with step-by-step reasoning, proper formulas, and chemical explanations.'
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
      console.error('Chemistry API error:', response.status, errorText);
      throw new Error(`Chemistry API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from Chemistry API');
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
