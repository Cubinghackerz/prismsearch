
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_AI_API_KEY = Deno.env.get('FALLBACK_GEMINI_API_KEY_5');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = "1:1", model = "imagen-3.0-generate-001" } = await req.json();
    
    console.log(`Generating image with prompt: ${prompt}`);

    if (!GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not configured');
    }

    // Call Google's Imagen API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate an image: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error:', response.status, errorText);
      throw new Error(`Google AI API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Note: This is a simplified implementation. Google's actual image generation
    // would require different API endpoints and handling
    const imageData = data.candidates?.[0]?.content?.parts?.[0];
    
    return new Response(
      JSON.stringify({ 
        success: true,
        imageData: imageData,
        prompt: prompt
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in google-image-gen function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred'
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
