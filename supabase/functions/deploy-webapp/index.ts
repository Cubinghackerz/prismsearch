
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
const NETLIFY_TOKEN = Deno.env.get('NETLIFY_TOKEN');

// In-memory storage for development deployments
// In a production scenario, you'd want to use Supabase Storage
const developmentDeployments = new Map<string, Record<string, string>>();

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
  // Create a unique deployment ID
  const deploymentId = crypto.randomUUID();
  
  // Store the files in memory (in production, you'd use Supabase Storage)
  developmentDeployments.set(deploymentId, files);
  
  // Create the development URL
  const devUrl = `https://fgpdfkvabwemivzjeitx.supabase.co/functions/v1/serve-webapp?id=${deploymentId}`;
  
  console.log(`Development deployment created: ${deploymentId}`);
  console.log('Files stored:', Object.keys(files));
  
  return {
    developmentUrl: devUrl,
    deploymentId: deploymentId
  };
}
