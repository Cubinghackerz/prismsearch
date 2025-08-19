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

async function generateWithGemini(prompt: string, modelVersion: string = 'gemini-2.0-flash-exp') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  // Map model versions to API endpoints
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

function createSystemPrompt(): string {
  return `You are a world-class UI/UX designer and frontend developer AI that creates exceptionally beautiful, modern web applications. 

Given a user prompt, generate a complete, visually stunning web application with the following structure:
- HTML: Complete, semantic HTML structure with accessibility in mind
- CSS: Beautiful, modern styling with stunning visual design, animations, and responsive layout
- JavaScript: Functional, smooth JavaScript with delightful interactions
- Description: Brief description emphasizing the visual appeal and user experience
- Features: Array of key features implemented with focus on UI/UX excellence

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
1. Use modern web standards (HTML5, CSS3, ES6+)
2. Implement CSS Grid and Flexbox for perfect layouts
3. Include CSS custom properties for consistent theming
4. Use semantic HTML elements and ARIA labels
5. Ensure cross-browser compatibility and performance
6. Include proper meta tags and viewport configuration
7. Implement smooth scrolling and optimized animations
8. Use modern JavaScript features and clean code structure

Return ONLY a valid JSON object with this exact structure:
{
  "html": "complete HTML content with semantic structure and accessibility",
  "css": "stunning, modern CSS with beautiful animations and responsive design",
  "javascript": "clean, functional JavaScript with smooth interactions",
  "description": "brief description emphasizing visual appeal and user experience",
  "features": ["UI-focused feature 1", "UX-focused feature 2", "visual feature 3"]
}

Focus on creating something that users will find visually impressive, highly functional, and delightful to use. Prioritize beautiful design, smooth interactions, and modern aesthetics.`;
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

  return parsedResponse;
}
