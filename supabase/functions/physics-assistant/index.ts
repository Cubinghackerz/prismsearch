
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

    console.log('Solving physics problem:', problem);
    console.log('Number of files uploaded:', files.length);

    let fileContext = '';
    if (files.length > 0) {
      fileContext = '\n\nUploaded files context:\n';
      for (const file of files) {
        const content = await file.text();
        fileContext += `File: ${file.name}\nContent: ${content}\n\n`;
      }
    }

    const physicsPrompt = `You are Qwen2.5-14B-Instruct-1M, an advanced physics reasoning AI model. Given the following physics problem, provide a comprehensive solution with deep analytical thinking.

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
11. If files are provided, analyze them and incorporate relevant information into the solution

Physics Problem: ${problem}${fileContext}

Please provide a detailed, step-by-step solution with clear physics reasoning:`;

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
          prompt: physicsPrompt,
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
          console.log('Physics solution generated successfully with local Qwen2.5-14B-Instruct-1M model');
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

Once installed, this assistant will provide comprehensive physics solutions with support for unlimited file uploads.`;

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
