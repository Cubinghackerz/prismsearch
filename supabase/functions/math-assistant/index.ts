
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const problem = formData.get('problem') as string;
    const files = formData.getAll('files') as File[];

    if (!problem) {
      throw new Error('Problem is required');
    }

    console.log('Solving math problem:', problem);
    console.log('Number of files uploaded:', files.length);

    let fileContext = '';
    if (files.length > 0) {
      console.log('Processing uploaded files...');
      for (const file of files) {
        const fileContent = await file.arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
        fileContext += `\n\nFile: ${file.name}\nContent (base64): ${base64Content}\n`;
      }
    }

    const mathPrompt = `You are Qwen3-235B-A22B-2507, an advanced mathematical reasoning AI model with multimodal capabilities. Given the following mathematical problem or expression, provide a comprehensive solution with deep analytical thinking.

Instructions:
1. Think step-by-step through the problem with detailed reasoning
2. Identify the type of mathematical problem (algebra, calculus, geometry, statistics, etc.)
3. If images are provided, analyze them carefully and extract relevant mathematical information
4. Provide step-by-step solution with clear explanations
5. Show all intermediate steps and reasoning processes
6. If it's an equation, solve for the variable(s) systematically
7. If it's calculus, show the integration/differentiation process with justification
8. If it's a word problem, set up the mathematical model first and explain your approach
9. Include any relevant mathematical concepts, theorems, or principles used
10. Format mathematical expressions clearly using standard notation
11. Provide the final answer clearly labeled with verification if possible
12. Use analytical thinking to explore alternative approaches when applicable

Mathematical Problem: ${problem}${fileContext}

Please provide a detailed, step-by-step solution with deep mathematical reasoning:`;

    // Try local Qwen model first
    let response;
    try {
      console.log('Attempting to use local Qwen3-235B-A22B-2507 model...');
      response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-235b-a22b-2507',
          prompt: mathPrompt,
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
          console.log('Math solution generated successfully with local Qwen model');
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
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;
    
    if (!solution) {
      throw new Error('No solution received from API');
    }

    console.log('Math solution generated successfully with Groq API');

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
