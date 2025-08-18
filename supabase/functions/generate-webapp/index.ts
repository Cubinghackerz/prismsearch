
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
        response = await generateWithGeminiProExp(prompt);
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

async function generateWithGeminiProExp(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
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
    console.error('Gemini Pro Exp API error:', response.status, errorText);
    throw new Error(`Gemini Pro Exp API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content received from Gemini Pro Exp API');
  }

  return parseAIResponse(content);
}

async function generateWithGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
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

function createSystemPrompt(): string {
  return `You are a professional web developer AI that creates complete, functional web applications with modern frameworks and best practices.

Given a user prompt, analyze the requirements and choose the most appropriate framework and file structure:

For simple apps: Use vanilla HTML/CSS/JavaScript
For interactive apps: Use React, Vue, or Svelte based on complexity
For enterprise apps: Consider Angular or React with TypeScript

Return ONLY a valid JSON object with this exact structure:
{
  "files": [
    {
      "filename": "string (e.g., index.html, App.tsx, main.css, package.json)",
      "content": "string (complete file content)",
      "language": "string (html, css, javascript, typescript, jsx, tsx, vue, svelte, json)",
      "type": "string (component, style, config, asset, test)"
    }
  ],
  "description": "brief description of the app",
  "features": ["feature 1", "feature 2", "feature 3"],
  "framework": "string (vanilla, react, vue, svelte, angular)",
  "packages": ["array of package names that would be npm installed"],
  "devDependencies": ["array of dev packages like build tools, testing"],
  "buildScript": "optional build command",
  "startScript": "optional start command"
}

Guidelines:
1. Choose appropriate framework based on complexity
2. Include ALL necessary files for a complete, functional application
3. Use modern web standards and best practices
4. Make it responsive and accessible
5. Include proper error handling
6. Use semantic HTML and modern CSS (Grid/Flexbox)
7. Include realistic package dependencies
8. Ensure cross-browser compatibility
9. Add TypeScript types when using React/Vue/Svelte
10. Include build configuration when needed

Do not include any markdown formatting or code blocks. Just the raw JSON.`;
}

function parseAIResponse(content: string) {
  // Parse the JSON response
  let parsedResponse;
  try {
    // Clean the response in case there's any markdown formatting
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    parsedResponse = JSON.parse(cleanContent);
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid JSON response from AI model');
  }

  // Validate the response structure
  if (!parsedResponse.files || !Array.isArray(parsedResponse.files)) {
    throw new Error('Invalid files structure in web app response');
  }

  // Ensure each file has required properties
  for (const file of parsedResponse.files) {
    if (!file.filename || !file.content || !file.language) {
      throw new Error('Incomplete file structure in web app response');
    }
  }

  return parsedResponse;
}
