import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Get available API keys
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const FALLBACK_GEMINI_API_KEY_1 = Deno.env.get('FALLBACK_GEMINI_API_KEY_1');
const FALLBACK_GEMINI_API_KEY_2 = Deno.env.get('FALLBACK_GEMINI_API_KEY_2');
const FALLBACK_GEMINI_API_KEY_3 = Deno.env.get('FALLBACK_GEMINI_API_KEY_3');
const FALLBACK_GEMINI_API_KEY_4 = Deno.env.get('FALLBACK_GEMINI_API_KEY_4');
const FALLBACK_GEMINI_API_KEY_5 = Deno.env.get('FALLBACK_GEMINI_API_KEY_5');

// Create array of all available Gemini API keys
const GEMINI_API_KEYS = [
  GEMINI_API_KEY,
  FALLBACK_GEMINI_API_KEY_1,
  FALLBACK_GEMINI_API_KEY_2,
  FALLBACK_GEMINI_API_KEY_3,
  FALLBACK_GEMINI_API_KEY_4,
  FALLBACK_GEMINI_API_KEY_5,
].filter(Boolean);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, workspaceContext, currentFiles, framework, language } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('AI Coding Assistant request:', { prompt, framework, language });

    if (GEMINI_API_KEYS.length === 0) {
      throw new Error('No Gemini API keys available');
    }

    const systemPrompt = createCodingSystemPrompt(framework, language, workspaceContext, currentFiles);
    const response = await sendGeminiPrompt(systemPrompt + '\n\nUser: ' + prompt);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in AI coding assistant:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process coding request'
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

function createCodingSystemPrompt(framework: string, language: string, workspaceContext: string, currentFiles: any): string {
  return `You are an expert AI coding assistant that helps users build applications using various frameworks and languages.

CURRENT WORKSPACE:
${workspaceContext}

CURRENT FILES:
${Object.keys(currentFiles || {}).length > 0 ? 
  Object.entries(currentFiles).map(([path, file]: [string, any]) => 
    `${path}: ${file.content.substring(0, 200)}${file.content.length > 200 ? '...' : ''}`
  ).join('\n') : 
  'No files in workspace yet'
}

INSTRUCTIONS:
1. Default to ${framework} with ${language} unless user specifies otherwise
2. For frontend projects, use Tailwind CSS for styling
3. When creating or modifying files, present clear file diffs
4. Always explain what you're doing and why
5. Suggest the next steps after making changes
6. If user wants to switch frameworks/languages, acknowledge and adapt

SUPPORTED FRAMEWORKS:
- Frontend: React, Vue.js, Svelte, Angular, Next.js
- Backend: Node.js/Express, NestJS, Django, Flask, FastAPI
- Other: Ruby on Rails, Spring Boot, Laravel

CODING WORKFLOW:
1. Understand the user's request
2. Explain your approach
3. Present file changes clearly with proper formatting
4. Suggest running commands (npm install, npm start, etc.)
5. Offer to help with next steps

FORMAT FILE CHANGES LIKE THIS:
Create file \`src/App.jsx\`:
\`\`\`jsx
import React from 'react';

export default function App() {
  return <div>Hello World</div>;
}
\`\`\`

Update file \`package.json\`:
\`\`\`json
{
  "name": "my-app",
  "dependencies": {
    "react": "^18.0.0"
  }
}
\`\`\`

Be conversational, helpful, and focused on building great applications.`;
}

async function sendGeminiPrompt(promptText: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = GEMINI_API_KEYS.length;
  let currentGeminiKeyIndex = 0;

  while (attempts < maxAttempts) {
    const currentApiKey = GEMINI_API_KEYS[currentGeminiKeyIndex];
    
    try {
      console.log(`Attempting Gemini request with key index ${currentGeminiKeyIndex} (attempt ${attempts + 1})`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${currentApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
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
        console.error(`Gemini API error with key index ${currentGeminiKeyIndex}:`, response.status, errorText);
        
        if (attempts < maxAttempts - 1) {
          currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
          attempts++;
          continue;
        }
        
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Gemini API');
      }

      if (currentGeminiKeyIndex > 0) {
        console.log(`Successfully used fallback Gemini API key (index ${currentGeminiKeyIndex})`);
      }

      return content.trim();
    } catch (error) {
      console.error(`Gemini API attempt ${attempts + 1} failed:`, error);
      
      if (attempts < maxAttempts - 1) {
        currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
        attempts++;
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('All Gemini API keys failed');
}