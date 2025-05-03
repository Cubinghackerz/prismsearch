
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the public bucket if it doesn't exist
    const { data: buckets, error: getBucketsError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (getBucketsError) throw getBucketsError

    // Check if the public bucket exists
    const publicBucket = buckets.find(bucket => bucket.name === 'public')
    
    if (!publicBucket) {
      const { error: createBucketError } = await supabaseAdmin
        .storage
        .createBucket('public', {
          public: true,
          fileSizeLimit: 5242880, // 5MB limit
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml',
            'text/plain',
            'application/pdf'
          ]
        })
      
      if (createBucketError) throw createBucketError
      
      console.log('Created public bucket')
    } else {
      console.log('Public bucket already exists')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Storage bucket setup complete' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
