
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { prompt, model = 'gemini' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const systemPrompt = `You are a professional web developer AI that creates complete, functional web applications. 

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

    // Parse the JSON response
    let parsedResponse;
    try {
      // Clean the response in case there's any markdown formatting
      const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      throw new Error('Invalid JSON response from AI model');
    }

    // Validate the response structure
    if (!parsedResponse.html || !parsedResponse.css || !parsedResponse.javascript) {
      throw new Error('Incomplete web app generated');
    }

    return new Response(
      JSON.stringify(parsedResponse),
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
