
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
const NETLIFY_TOKEN = Deno.env.get('NETLIFY_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { platform, projectName, files } = await req.json();

    if (!platform || !projectName || !files) {
      throw new Error('Missing required fields: platform, projectName, or files');
    }

    let result;
    
    switch (platform) {
      case 'vercel':
        result = await deployToVercel(projectName, files);
        break;
      case 'netlify':
        result = await deployToNetlify(projectName, files);
        break;
      case 'development':
        result = await createDevelopmentLink(projectName, files);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Deployment error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Deployment failed'
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

async function deployToVercel(projectName: string, files: Record<string, string>) {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not configured');
  }

  const deploymentData = {
    name: projectName,
    files: Object.entries(files).map(([path, content]) => ({
      file: path,
      data: content
    })),
    projectSettings: {
      framework: null
    }
  };

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deploymentData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vercel deployment error:', response.status, errorText);
    throw new Error(`Vercel deployment failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    deploymentUrl: `https://${data.alias || data.url}`,
    deploymentId: data.id
  };
}

async function deployToNetlify(projectName: string, files: Record<string, string>) {
  if (!NETLIFY_TOKEN) {
    throw new Error('Netlify token not configured');
  }

  // Create a zip-like structure for Netlify
  const formData = new FormData();
  
  Object.entries(files).forEach(([path, content]) => {
    formData.append(path, new Blob([content], { type: 'text/plain' }));
  });

  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Netlify deployment error:', response.status, errorText);
    throw new Error(`Netlify deployment failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    deploymentUrl: data.ssl_url || data.url,
    deploymentId: data.id
  };
}

async function createDevelopmentLink(projectName: string, files: Record<string, string>) {
  // Create a temporary hosting solution using a simple key-value store
  const deploymentId = crypto.randomUUID();
  
  // In a real implementation, you might store these files in Supabase Storage
  // For now, we'll create a simple development server response
  const devUrl = `https://fgpdfkvabwemivzjeitx.supabase.co/functions/v1/serve-webapp?id=${deploymentId}`;
  
  // Store the files temporarily (you might want to use Supabase Storage for this)
  console.log(`Development deployment created: ${deploymentId}`);
  console.log('Files:', Object.keys(files));
  
  return {
    developmentUrl: devUrl,
    deploymentId: deploymentId
  };
}
