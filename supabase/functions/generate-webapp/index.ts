import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, model = 'gemini' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let response;
    
    switch (model) {
      case 'gemini':
        response = await generateWithGemini(prompt);
        break;
      case 'gemini-cli':
        response = await generateWithGeminiCLI(prompt);
        break;
      case 'qwen3-coder':
        response = await generateWithQwen3Coder(prompt);
        break;
      case 'code-llama':
        response = await generateWithCodeLlama(prompt);
        break;
      case 'deepseek-coder-v2':
        response = await generateWithDeepSeekCoderV2(prompt);
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
        // Handle Groq models
        if (model.startsWith('groq-')) {
          response = await generateWithGroq(prompt, model);
        } else {
          throw new Error(`Unsupported model: ${model}`);
        }
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
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate web app';
    let statusCode = 500;
    
    if (error.message?.includes('API key not configured')) {
      errorMessage = 'AI service not configured. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to AI service. Please try again.';
      statusCode = 502;
    } else if (error.message?.includes('Unsupported model')) {
      errorMessage = error.message;
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message || 'Unknown error occurred'
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function generateWithGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  try {
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
  } catch (fetchError) {
    console.error('Network error calling Gemini API:', fetchError);
    throw new Error(`Failed to fetch from Gemini API: ${fetchError.message}`);
  }
}

async function generateWithGeminiCLI(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const systemPrompt = createCodeFocusedSystemPrompt();
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
        temperature: 0.3,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini CLI API error:', response.status, errorText);
    throw new Error(`Gemini CLI API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content received from Gemini CLI API');
  }

  return parseAIResponse(content);
}

async function generateWithQwen3Coder(prompt: string) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured for Qwen3 Coder');
  }

  const systemPrompt = createCodeFocusedSystemPrompt();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile', // Using available model as placeholder for Qwen3
      messages: [
        {
          role: 'system',
          content: systemPrompt + '\n\nYou are Qwen3-Coder, a specialized coding AI model. Focus on generating clean, efficient, and well-documented code.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Qwen3 Coder API error:', response.status, errorText);
    throw new Error(`Qwen3 Coder API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from Qwen3 Coder API');
  }

  return parseAIResponse(content);
}

async function generateWithCodeLlama(prompt: string) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured for Code Llama');
  }

  const systemPrompt = createCodeFocusedSystemPrompt();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192', // Using available model as placeholder for Code Llama
      messages: [
        {
          role: 'system',
          content: systemPrompt + '\n\nYou are Code Llama, Meta\'s specialized code generation model. Focus on producing clean, efficient, and well-structured code with excellent performance characteristics.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Code Llama API error:', response.status, errorText);
    throw new Error(`Code Llama API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from Code Llama API');
  }

  return parseAIResponse(content);
}

async function generateWithDeepSeekCoderV2(prompt: string) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured for DeepSeek-Coder-V2');
  }

  const systemPrompt = createCodeFocusedSystemPrompt();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768', // Using available model as placeholder for DeepSeek-Coder-V2
      messages: [
        {
          role: 'system',
          content: systemPrompt + '\n\nYou are DeepSeek-Coder-V2, an advanced open-source coding model. Emphasize code quality, maintainability, and following best practices in software development.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8192,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DeepSeek-Coder-V2 API error:', response.status, errorText);
    throw new Error(`DeepSeek-Coder-V2 API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from DeepSeek-Coder-V2 API');
  }

  return parseAIResponse(content);
}

async function generateWithGroq(prompt: string, model: string) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const systemPrompt = createSystemPrompt();
  
  // Map model names to actual Groq model IDs
  const modelMap = {
    'groq-llama4-maverick': 'llama-3.1-70b-versatile',
    'groq-llama4-scout': 'llama-3.1-8b-instant',
    'groq-llama31-8b-instant': 'llama-3.1-8b-instant'
  };
  
  const groqModel = modelMap[model] || 'llama-3.1-70b-versatile';
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: groqModel,
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
    console.error('Groq API error:', response.status, errorText);
    throw new Error(`Groq API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from Groq API');
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

function createCodeFocusedSystemPrompt(): string {
  return `You are a specialized code generation AI that creates complete, functional web applications with a focus on clean, efficient code.

Given a user prompt, generate a complete web application with the following structure:
- HTML: Semantic, well-structured HTML
- CSS: Clean, modern styling with best practices
- JavaScript: Efficient, well-commented, and maintainable code
- Description: Technical description of the application
- Features: Array of implemented features

Code Quality Guidelines:
1. Write clean, readable, and maintainable code
2. Use modern JavaScript features (ES6+, async/await, modules)
3. Implement proper error handling and validation
4. Follow coding best practices and conventions
5. Include comprehensive comments for complex logic
6. Use efficient algorithms and data structures
7. Ensure code is scalable and extensible
8. Implement proper separation of concerns
9. Use semantic HTML and accessible design patterns
10. Write performance-optimized CSS

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

  return parsedResponse;
}
