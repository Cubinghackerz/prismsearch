import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Fallback Gemini API keys with correct names
const FALLBACK_GEMINI_KEYS = [
  Deno.env.get('FALLBACK_GEMINI_API_KEY_1'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_2'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_3'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_4'),
  Deno.env.get('FALLBACK_GEMINI_API_KEY_5'),
].filter(key => key !== null);

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
        response = await generateWithGeminiWithFallback(prompt, 'gemini-2.5-pro-exp-03-25');
        break;
      case 'gemini':
        response = await generateWithGeminiWithFallback(prompt);
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

async function generateWithGeminiWithFallback(prompt: string, modelVersion: string = 'gemini-2.0-flash-exp') {
  const allKeys = [GEMINI_API_KEY, ...FALLBACK_GEMINI_KEYS].filter(key => key !== null);
  
  if (allKeys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  let lastError;
  
  for (let i = 0; i < allKeys.length; i++) {
    try {
      console.log(`Attempting Gemini API call with key ${i + 1}/${allKeys.length}`);
      return await generateWithGemini(prompt, modelVersion, allKeys[i]);
    } catch (error) {
      console.error(`Gemini API key ${i + 1} failed:`, error.message);
      lastError = error;
      
      // If it's a rate limit or quota error, try the next key
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
        continue;
      }
      
      // For other errors, also try the next key but log it
      if (i < allKeys.length - 1) {
        console.log(`Trying fallback key ${i + 2}...`);
        continue;
      }
    }
  }
  
  throw new Error(`All Gemini API keys failed. Last error: ${lastError?.message}`);
}

async function generateWithGemini(prompt: string, modelVersion: string = 'gemini-2.0-flash-exp', apiKey: string) {
  if (!apiKey) {
    throw new Error('Gemini API key not provided');
  }

  const systemPrompt = createSystemPrompt();
  
  const modelEndpoint = modelVersion === 'gemini-2.5-pro-exp-03-25' 
    ? 'gemini-2.0-flash-exp'  // Use available model instead of experimental one
    : 'gemini-2.0-flash-exp';
  
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
  return `You are a world-class full-stack developer and UI/UX designer AI that creates complete, production-ready web applications with modern frameworks and technologies.

Given a user prompt, generate a complete web application with unlimited files following proper project structure:

TECHNOLOGY OPTIONS (choose the most appropriate):
1. **Vanilla Web App**: HTML5, CSS3, JavaScript ES6+
2. **React Application**: React 18+, TypeScript, modern hooks
3. **Vue.js Application**: Vue 3, Composition API, TypeScript
4. **Angular Application**: Angular 16+, TypeScript, standalone components
5. **Node.js Backend**: Express.js, TypeScript, REST APIs
6. **Static Site**: HTML5, CSS3, minimal JavaScript

FRAMEWORK-SPECIFIC FEATURES:
- **React**: Components, hooks, context, routing with React Router
- **Vue**: Composition API, reactive refs, Vue Router, Pinia store
- **Angular**: Components, services, dependency injection, Angular Router
- **Node.js**: Express middleware, authentication, database integration
- **TypeScript**: Strong typing, interfaces, generics, modern features

MODERN DEVELOPMENT PRACTICES:
1. **File Structure**: Follow framework conventions (components/, pages/, utils/, types/)
2. **TypeScript**: Use TypeScript when beneficial for type safety
3. **State Management**: Context API, Pinia, NgRx, or Zustand as appropriate
4. **Styling**: CSS Modules, Styled Components, Tailwind CSS, or SCSS
5. **Package Management**: Include package.json with proper dependencies
6. **Build Tools**: Vite, Webpack, or framework-specific build configs
7. **Testing**: Jest, Vitest, or Cypress setup files
8. **Linting**: ESLint, Prettier configuration files

RESPONSE STRUCTURE - Return a JSON object with unlimited files:
{
  "framework": "react|vue|angular|vanilla|nodejs",
  "language": "typescript|javascript",
  "description": "Brief description of the application and chosen tech stack",
  "features": ["feature 1", "feature 2", "..."],
  "files": {
    "package.json": "package configuration with dependencies",
    "tsconfig.json": "TypeScript configuration (if applicable)",
    "vite.config.ts": "Build tool configuration (if applicable)",
    "index.html": "Main HTML entry point",
    "src/main.ts": "Application entry point",
    "src/App.tsx": "Main application component (if framework)",
    "src/components/ComponentName.tsx": "Individual components",
    "src/pages/PageName.tsx": "Page components",
    "src/types/index.ts": "TypeScript type definitions",
    "src/utils/helpers.ts": "Utility functions",
    "src/styles/main.css": "Main stylesheet",
    "src/styles/components.css": "Component styles",
    "public/favicon.ico": "Static assets (base64 encoded for small files)",
    "README.md": "Project documentation and setup instructions"
  },
  "dependencies": {
    "production": ["react@18.x", "typescript@5.x", "..."],
    "development": ["@types/react@18.x", "vite@4.x", "..."]
  },
  "scripts": {
    "dev": "development server command",
    "build": "production build command",
    "preview": "preview built application"
  }
}

DESIGN EXCELLENCE GUIDELINES:
1. Create visually stunning interfaces with modern design principles
2. Use beautiful color palettes, gradients, and sophisticated styling
3. Implement smooth animations, transitions, and micro-interactions
4. Apply contemporary design trends (glassmorphism, neumorphism, modern minimalism)
5. Ensure perfect responsive design for all screen sizes
6. Use modern typography with proper hierarchy and spacing
7. Include delightful hover effects and interactive feedback
8. Apply proper shadows, depth, and visual layering
9. Ensure high contrast and accessibility compliance
10. Create intuitive user flows and navigation

TECHNICAL EXCELLENCE GUIDELINES:
1. Use modern web standards and best practices
2. Implement proper TypeScript types and interfaces
3. Follow framework-specific patterns and conventions
4. Include proper error handling and loading states
5. Ensure cross-browser compatibility and performance
6. Implement proper SEO and meta tag configurations
7. Use modern JavaScript/TypeScript features
8. Follow component-driven development principles
9. Include proper file organization and imports
10. Implement responsive design with CSS Grid/Flexbox

Choose the most appropriate technology stack based on the user's requirements. For simple applications, use vanilla technologies. For complex applications with state management needs, choose React, Vue, or Angular. Always include proper project structure with unlimited files as needed.

Focus on creating production-ready, scalable applications that developers can immediately run and deploy.`;
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

  // Validate the response structure for the new format
  if (!parsedResponse.files || !parsedResponse.framework) {
    throw new Error('Incomplete web app generated - missing required fields');
  }

  return parsedResponse;
}
