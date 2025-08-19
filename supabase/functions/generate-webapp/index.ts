
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, model = 'gemini-2.5-pro-exp-03-25' } = await req.json()

    const systemPrompt = `You are an expert full-stack developer specializing in modern web applications. Generate a complete, functional, and visually stunning web application based on the user's requirements.

CRITICAL REQUIREMENTS:
1. Generate COMPLETE file structures with ALL necessary files
2. Create fully functional applications that work immediately in a browser
3. Support modern frameworks: React, Vue, Angular, Svelte with TypeScript
4. Include all configuration files (package.json, tsconfig.json, etc.)
5. Generate actual working code, not placeholders or comments

DESIGN REQUIREMENTS:
- Create visually stunning, modern interfaces with beautiful aesthetics
- Use contemporary design principles and modern CSS/styling frameworks
- Implement responsive design for all screen sizes
- Include smooth animations and micro-interactions
- Apply modern color schemes and typography

TECHNICAL SPECIFICATIONS:
- Use TypeScript for type safety when appropriate
- Follow modern development patterns and best practices
- Generate clean, semantic, and well-structured code
- Include proper error handling and validation
- Ensure optimal performance and accessibility

OUTPUT FORMAT:
Return ONLY a valid JSON object with this EXACT structure:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "complete file content here",
      "type": "tsx"
    },
    {
      "path": "src/main.tsx", 
      "content": "complete file content here",
      "type": "tsx"
    },
    {
      "path": "package.json",
      "content": "complete package.json with all dependencies",
      "type": "json"
    }
  ],
  "description": "Brief description emphasizing functionality and visual appeal",
  "features": ["feature 1", "feature 2", "feature 3"],
  "framework": "React|Vue|Angular|Svelte|Vanilla",
  "packages": ["@types/react", "@types/node", "typescript", "tailwindcss"]
}

Generate a production-ready application that works immediately when the files are used. Include ALL necessary dependencies and configuration files.`

    let apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
    let headers = {
      'Content-Type': 'application/json',
    }
    let body

    // Handle different AI models
    if (model === 'gemini-2.5-pro-exp-03-25') {
      apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
      headers['Authorization'] = `Bearer ${Deno.env.get('GEMINI_API_KEY')}`
      body = {
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      }
    } else {
      // Fallback for other models
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
      headers['Authorization'] = `Bearer ${Deno.env.get('GROQ_API_KEY')}`
      body = {
        model: model === 'groq-llama4-maverick' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    let generatedText = ''
    if (model === 'gemini-2.5-pro-exp-03-25') {
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } else {
      generatedText = data.choices?.[0]?.message?.content || ''
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const generatedApp = JSON.parse(jsonMatch[0])

    // Validate the generated app structure
    if (!generatedApp.files || !Array.isArray(generatedApp.files)) {
      throw new Error('Invalid app structure: missing files array')
    }

    // Ensure all required fields exist
    const validatedApp = {
      files: generatedApp.files,
      description: generatedApp.description || 'Generated web application',
      features: Array.isArray(generatedApp.features) ? generatedApp.features : [],
      framework: generatedApp.framework || 'React',
      packages: Array.isArray(generatedApp.packages) ? generatedApp.packages : []
    }

    return new Response(JSON.stringify(validatedApp), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error generating webapp:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate web application'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
