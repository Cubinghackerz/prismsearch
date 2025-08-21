
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const FALLBACK_GEMINI_API_KEY_5 = Deno.env.get('FALLBACK_GEMINI_API_KEY_5');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = '1:1', model = 'imagen-3.0-generate-001' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!FALLBACK_GEMINI_API_KEY_5) {
      throw new Error('Google API key not configured');
    }

    console.log('Generating image with prompt:', prompt);

    const response = await fetch(`https://aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/publishers/google/models/${model}:predict`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FALLBACK_GEMINI_API_KEY_5}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt,
          sampleCount: 1
        }],
        parameters: {
          aspectRatio: aspectRatio,
          safetyFilterLevel: "block_some",
          personGeneration: "allow_adult"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Imagen API error:', response.status, errorText);
      
      // Fallback to Gemini's image generation if Imagen fails
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${FALLBACK_GEMINI_API_KEY_5}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a detailed image based on this prompt: ${prompt}. Make it visually appealing and high quality.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!geminiResponse.ok) {
          throw new Error(`Gemini fallback failed: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return new Response(
          JSON.stringify({ 
            success: true,
            imageUrl: null,
            description: description,
            fallback: true,
            message: 'Image generation not available, but here\'s a detailed description of what would be created.'
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (geminiError) {
        console.error('Gemini fallback error:', geminiError);
        throw new Error(`Both Imagen and Gemini fallback failed: ${errorText}`);
      }
    }

    const data = await response.json();
    const imageData = data.predictions?.[0]?.bytesBase64Encoded;
    
    if (!imageData) {
      throw new Error('No image data received from Imagen API');
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${imageData}`;

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageUrl,
        prompt: prompt,
        aspectRatio: aspectRatio
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating image:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to generate image'
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
