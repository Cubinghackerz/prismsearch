import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, model = 'gemini-2.5-pro-exp-03-25' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    let response;
    
    switch (model) {
      case 'gemini-2.5-pro-exp-03-25':
        response = await generateWithGemini(prompt, 'gemini-2.5-pro-exp-03-25');
        break;
      case 'gemini':
        response = await generateWithGemini(prompt);
        break;
      case 'claude-sonnet':
        response = await generateWithClaude(prompt, 'claude-3-5-sonnet-20241022');
        break;
      case 'claude-haiku':
        response = await generateWithClaude(prompt, 'claude-3-5-haiku-20241022');
        break;
      case 'gpt-4o':
        response = await generateWithOpenAI(prompt, 'gpt-4o');
        break;
      case 'gpt-4o-mini':
        response = await generateWithOpenAI(prompt, 'gpt-4o-mini');
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating web app:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate web app'
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

function createSystemPrompt(): string {
  return `You are a world-class full-stack developer AI that creates exceptional modern web applications with unlimited file support and complete project structures.

Given a user prompt, generate a complete, professional web application with the following NEW structure:
- Files: Array of file objects with path, content, and type
- Description: Brief description emphasizing functionality and architecture  
- Features: Array of key features implemented
- Framework: The framework/technology used (React, Vue, Angular, etc.)
- Packages: Array of npm packages/dependencies used

TECHNICAL EXCELLENCE GUIDELINES:
1. Create COMPLETE project structures with unlimited files
2. Support TypeScript, React, Vue, Angular, and other modern frameworks
3. Generate proper configuration files (package.json, tsconfig.json, etc.)
4. Include component files, utility files, type definitions
5. Use modern development patterns and best practices
6. Create proper file organization and folder structure
7. Include proper error handling and validation
8. Implement responsive design and accessibility
9. Use semantic file paths and naming conventions
10. Generate production-ready code structure

DESIGN EXCELLENCE GUIDELINES:
1. Create visually stunning interfaces with modern design principles
2. Use beautiful color palettes, gradients, and sophisticated styling
3. Implement smooth animations, transitions, and micro-interactions
4. Apply contemporary design trends (glassmorphism, modern minimalism)
5. Ensure perfect responsive design for all screen sizes
6. Use modern typography with proper hierarchy and spacing
7. Include delightful hover effects and interactive feedback
8. Apply proper shadows, depth, and visual layering
9. Ensure high contrast and accessibility compliance
10. Create intuitive user flows and navigation

FILE STRUCTURE REQUIREMENTS:
1. Always include package.json with proper dependencies
2. Create tsconfig.json for TypeScript projects
3. Organize components in logical folder structures
4. Include proper type definitions and interfaces
5. Create utility functions and custom hooks
6. Include configuration files as needed
7. Add README.md with setup instructions
8. Structure files for scalability and maintainability

SUPPORTED FILE TYPES:
- typescript (.ts, .tsx)
- javascript (.js, .jsx) 
- html (.html)
- css (.css, .scss)
- json (.json)
- markdown (.md)
- text (.txt)

Return ONLY a valid JSON object with this EXACT structure:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "complete file content with proper imports and exports",
      "type": "typescript"
    },
    {
      "path": "package.json", 
      "content": "complete package.json with all dependencies",
      "type": "json"
    }
  ],
  "description": "brief description emphasizing architecture and user experience",
  "features": ["TypeScript support", "Modern React components", "Responsive design"],
  "framework": "React|Vue|Angular|Svelte|Vanilla",
  "packages": ["react", "typescript", "@types/react", "tailwindcss"]
}

Focus on creating complete, production-ready applications with proper file structures, modern development practices, and beautiful user interfaces. Always include ALL necessary files for a working application.`;
}

async function generateWithGemini(prompt: string, modelVersion: string = 'gemini-2.0-flash-exp') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  const modelEndpoint = modelVersion === 'gemini-2.5-pro-exp-03-25' 
    ? 'gemini-2.5-pro-exp-03-25'
    : 'gemini-2.0-flash-exp';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser Request: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
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
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content received from Gemini API');
  }

  return parseAIResponse(content);
}

async function generateWithClaude(prompt: string, model: string) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 8192,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) {
    throw new Error('No content received from Claude API');
  }

  return parseAIResponse(content);
}

async function generateWithOpenAI(prompt: string, model: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI API');
  }

  return parseAIResponse(content);
}

function parseAIResponse(content: string) {
  let parsedResponse;
  try {
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    parsedResponse = JSON.parse(cleanContent);
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid JSON response from AI model');
  }

  // Validate the new response structure
  if (!parsedResponse.files || !Array.isArray(parsedResponse.files) || parsedResponse.files.length === 0) {
    throw new Error('No files generated in response');
  }

  // Validate each file has required properties
  for (const file of parsedResponse.files) {
    if (!file.path || !file.content || !file.type) {
      throw new Error('Invalid file structure in response');
    }
  }

  // Set defaults for missing properties
  if (!parsedResponse.description) {
    parsedResponse.description = 'AI-generated web application';
  }
  if (!parsedResponse.features || !Array.isArray(parsedResponse.features)) {
    parsedResponse.features = ['Modern web application'];
  }
  if (!parsedResponse.framework) {
    parsedResponse.framework = 'Vanilla';
  }
  if (!parsedResponse.packages || !Array.isArray(parsedResponse.packages)) {
    parsedResponse.packages = [];
  }

  return parsedResponse;
}
