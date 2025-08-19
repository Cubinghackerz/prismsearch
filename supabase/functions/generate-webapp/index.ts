
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const FALLBACK_GEMINI_API_KEY_1 = Deno.env.get('FALLBACK_GEMINI_API_KEY_1');
const FALLBACK_GEMINI_API_KEY_2 = Deno.env.get('FALLBACK_GEMINI_API_KEY_2');
const FALLBACK_GEMINI_API_KEY_3 = Deno.env.get('FALLBACK_GEMINI_API_KEY_3');
const FALLBACK_GEMINI_API_KEY_4 = Deno.env.get('FALLBACK_GEMINI_API_KEY_4');
const FALLBACK_GEMINI_API_KEY_5 = Deno.env.get('FALLBACK_GEMINI_API_KEY_5');

const GEMINI_API_KEYS = [
  GEMINI_API_KEY,
  FALLBACK_GEMINI_API_KEY_1,
  FALLBACK_GEMINI_API_KEY_2,
  FALLBACK_GEMINI_API_KEY_3,
  FALLBACK_GEMINI_API_KEY_4,
  FALLBACK_GEMINI_API_KEY_5,
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
      case 'gemini-2.0-flash-exp':
        response = await generateWithGemini(prompt, 'gemini-2.0-flash-exp');
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

async function generateWithGemini(prompt: string, modelName: string) {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  const systemPrompt = createSystemPrompt();
  let lastError;

  // Try each API key in sequence
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    console.log(`Attempting with Gemini API key ${i + 1}/${GEMINI_API_KEYS.length} for model: ${modelName}`);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
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
        console.error(`Gemini API error with key ${i + 1}:`, response.status, errorText);
        lastError = new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
        
        // If it's a rate limit or quota error, try the next key
        if (response.status === 429 || response.status === 403) {
          console.log(`Rate limit or quota exceeded with key ${i + 1}, trying next key...`);
          continue;
        }
        
        // For other errors, still try the next key but log it
        console.log(`Error with key ${i + 1}, trying next key...`);
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        lastError = new Error('No content received from Gemini API');
        continue;
      }

      console.log(`Successfully generated content with Gemini API key ${i + 1}`);
      return parseAIResponse(content);

    } catch (error) {
      console.error(`Error with Gemini API key ${i + 1}:`, error);
      lastError = error;
      continue;
    }
  }

  // If all keys failed, throw the last error
  throw lastError || new Error('All Gemini API keys failed');
}

function createSystemPrompt(): string {
  return `You are a professional web developer AI that creates complete, functional web applications. 

Given a user prompt, generate a complete web application with the following structure:
- HTML: Complete, semantic HTML structure
- CSS: Modern, responsive styling with animations and good UX
- JavaScript: Functional, well-commented JavaScript code
- Description: Brief description of the application
- Features: Array of key features implemented

Guidelines:
1. Use modern web standards (HTML5, CSS3, ES6+)
2. Make it responsive and mobile-friendly
3. Include proper accessibility features
4. Use semantic HTML elements
5. Implement smooth animations and transitions
6. Ensure cross-browser compatibility
7. Include error handling in JavaScript
8. Make it visually appealing with modern design principles
9. Use CSS Grid/Flexbox for layouts
10. Include interactive elements and user feedback

Return ONLY a valid JSON object with this exact structure:
{
  "html": "complete HTML content",
  "css": "complete CSS styles",
  "javascript": "complete JavaScript code",
  "description": "brief description of the app",
  "features": ["feature 1", "feature 2", "feature 3"]
}

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
  if (!parsedResponse.html || !parsedResponse.css || !parsedResponse.javascript) {
    throw new Error('Incomplete web app generated');
  }

  // Ensure all properties are strings
  return {
    html: String(parsedResponse.html || ''),
    css: String(parsedResponse.css || ''),
    javascript: String(parsedResponse.javascript || ''),
    description: String(parsedResponse.description || 'Generated web application'),
    features: Array.isArray(parsedResponse.features) ? parsedResponse.features : []
  };
}
