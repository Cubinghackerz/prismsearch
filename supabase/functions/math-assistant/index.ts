
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

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
      fileContext = '\n\nUploaded files context:\n';
      for (const file of files) {
        const content = await file.text();
        fileContext += `File: ${file.name}\nContent: ${content}\n\n`;
      }
    }

    const mathPrompt = `You are Qwen2.5-14B-Instruct-1M, an advanced mathematical reasoning AI model. Given the following mathematical problem or expression, provide a comprehensive solution with deep analytical thinking.

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
12. If files are provided, analyze them and incorporate relevant information into the solution

Mathematical Problem: ${problem}${fileContext}

Please provide a detailed, step-by-step solution with deep mathematical reasoning:`;

    // Try local Qwen2.5-14B-Instruct-1M model first
    let response;
    try {
      console.log('Attempting to use local Qwen2.5-14B-Instruct-1M model...');
      response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:14b-instruct-1m',
          prompt: mathPrompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 16384,
            context_length: 1048576
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const solution = data.response;
        
        if (solution) {
          console.log('Math solution generated successfully with local Qwen2.5-14B-Instruct-1M model');
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
      console.log('Local Qwen2.5-14B-Instruct-1M model not available:', localError.message);
    }

    // Fallback message
    const fallbackSolution = `I apologize, but the Qwen2.5-14B-Instruct-1M model is not currently available locally. Please ensure:

1. Ollama is running locally on port 11434
2. The qwen2.5:14b-instruct-1m model is installed: \`ollama pull qwen2.5:14b-instruct-1m\`
3. The model has sufficient system resources (recommended: 16GB+ RAM)

Problem received: ${problem}
Files uploaded: ${files.length}

To install the model locally, run:
\`\`\`bash
ollama pull qwen2.5:14b-instruct-1m
\`\`\`

Once installed, this assistant will provide comprehensive mathematical solutions with support for unlimited file uploads.`;

    return new Response(
      JSON.stringify({ solution: fallbackSolution }),
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
