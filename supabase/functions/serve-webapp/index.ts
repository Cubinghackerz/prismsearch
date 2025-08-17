
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// In-memory storage for development deployments
// In a production scenario, you'd want to use Supabase Storage or another persistent storage
const deployments = new Map<string, Record<string, string>>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const deploymentId = url.searchParams.get('id');
    
    if (!deploymentId) {
      return new Response('Missing deployment ID', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // For now, we'll create a simple HTML page that shows the deployment info
    // In a real implementation, you'd retrieve the stored files and serve them
    const files = deployments.get(deploymentId);
    
    if (!files) {
      // Create a default response for development deployments
      const defaultHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Development Deployment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: #f8fafc;
            color: #1e293b;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        .info {
            background: #e0f2fe;
            padding: 1rem;
            border-radius: 4px;
            border-left: 4px solid #0284c7;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">✅ Development Link Active</div>
        <h1>Your Web App is Ready!</h1>
        <p>This is your development deployment with ID: <code>${deploymentId}</code></p>
        
        <div class="info">
            <strong>Note:</strong> This is a development link for testing and sharing. 
            Your actual web app files would be served here in a complete implementation.
            For production deployments, use Vercel or Netlify options.
        </div>
        
        <p>Features available in this development environment:</p>
        <ul>
            <li>Shareable URL for testing</li>
            <li>Quick deployment without external services</li>
            <li>Perfect for demonstrations and feedback</li>
        </ul>
    </div>
</body>
</html>`;

      return new Response(defaultHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      });
    }

    // If files exist, serve the main HTML file
    return new Response(files['index.html'] || 'No content found', {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Serve webapp error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to serve webapp',
        message: error.message 
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
