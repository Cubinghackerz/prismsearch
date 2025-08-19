
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Fallback Gemini API keys
const FALLBACK_GEMINI_KEYS = [
  Deno.env.get('FALLBACK_GEMINI_API_KEY_1'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_2'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_3'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_4'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_5'),
].filter(Boolean); // Remove null/undefined values

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

async function generateWithGemini(prompt: string, modelVersion: string = 'gemini-2.0-flash-exp') {
  const systemPrompt = createSystemPrompt();
  
  const modelEndpoint = modelVersion === 'gemini-2.5-pro-exp-03-25' 
    ? 'gemini-2.5-pro-exp-03-25'
    : 'gemini-2.0-flash-exp';
  
  // Try main API key first, then fallbacks
  const allKeys = [GEMINI_API_KEY, ...FALLBACK_GEMINI_KEYS].filter(Boolean);
  
  if (allKeys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  let lastError: Error | null = null;

  for (let i = 0; i < allKeys.length; i++) {
    const apiKey = allKeys[i];
    console.log(`Trying Gemini API key ${i + 1}/${allKeys.length}`);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
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
        console.error(`Gemini API key ${i + 1} failed:`, response.status, errorText);
        lastError = new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
        continue; // Try next key
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        lastError = new Error('No content received from Gemini API');
        continue; // Try next key
      }

      console.log(`Successfully used Gemini API key ${i + 1}`);
      return parseAIResponse(content);

    } catch (error) {
      console.error(`Error with Gemini API key ${i + 1}:`, error);
      lastError = error;
      continue; // Try next key
    }
  }

  // If we get here, all keys failed
  throw lastError || new Error('All Gemini API keys failed');
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
  return `You are a world-class full-stack developer and UI/UX designer AI that creates modern, production-ready web applications with multiple files and proper project structure.

Given a user prompt, generate a complete web application with the following enhanced structure:

SUPPORTED FRAMEWORKS & TECHNOLOGIES:
- React with TypeScript (recommended for complex apps)
- Vue.js with TypeScript
- Angular with TypeScript  
- Svelte/SvelteKit
- Next.js (React framework)
- Nuxt.js (Vue framework)
- Vanilla JavaScript/TypeScript
- Modern CSS (Grid, Flexbox, Custom Properties)
- Popular packages: Tailwind CSS, Lodash, Chart.js, Framer Motion, etc.

MULTI-FILE ARCHITECTURE:
- Generate proper project structure with multiple files
- Include package.json with appropriate dependencies
- Add TypeScript configuration when using TypeScript
- Create component files for frameworks like React/Vue
- Include utility files, styles, and assets as needed
- Follow modern development practices and file organization

TECHNICAL EXCELLENCE:
1. Use modern ES6+ syntax and TypeScript when appropriate
2. Implement proper component architecture for frameworks
3. Include error handling and loading states
4. Ensure responsive design and accessibility
5. Use modern CSS techniques and design systems
6. Include proper type definitions for TypeScript projects
7. Follow framework-specific best practices
8. Implement proper state management patterns

DESIGN EXCELLENCE:
1. Create beautiful, modern interfaces with stunning visual design
2. Use sophisticated color schemes and typography
3. Implement smooth animations and micro-interactions
4. Apply contemporary design trends appropriately
5. Ensure perfect responsive layouts
6. Include proper spacing, shadows, and visual hierarchy
7. Focus on excellent user experience and usability

Return ONLY a valid JSON object with this exact structure:
{
  "html": "main HTML file content with semantic structure",
  "css": "main CSS file with beautiful, responsive design",
  "javascript": "main JavaScript/TypeScript file with modern code",
  "description": "brief description emphasizing technology stack and features",
  "features": ["feature 1 with tech focus", "feature 2", "feature 3"],
  "files": [
    {
      "name": "component.tsx",
      "content": "component code",
      "type": "tsx",
      "path": "src/components/component.tsx"
    }
  ],
  "framework": "specific framework used (React, Vue, Angular, etc.)",
  "packages": ["package1", "package2", "package3"],
  "fileStructure": ["index.html", "src/", "src/components/", "package.json"]
}

Focus on creating production-ready applications with proper architecture, beautiful design, and modern development practices. Always consider the appropriate technology stack for the requested application complexity.`;
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

  if (!parsedResponse.html || !parsedResponse.css || !parsedResponse.javascript) {
    throw new Error('Incomplete web app generated');
  }

  // Ensure required fields have defaults
  parsedResponse.files = parsedResponse.files || [];
  parsedResponse.framework = parsedResponse.framework || 'Vanilla JavaScript';
  parsedResponse.packages = parsedResponse.packages || [];
  parsedResponse.fileStructure = parsedResponse.fileStructure || ['index.html', 'styles.css', 'script.js'];

  return parsedResponse;
}
