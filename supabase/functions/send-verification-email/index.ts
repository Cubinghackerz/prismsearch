
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple email sending without external services
// This is a mock implementation that logs to console
// In production, you would integrate with a service like Resend, SendGrid, etc.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();
    
    // Mock email sending - in production replace with actual email service
    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`🔐 Verification code: ${code}`);
    
    // Simulate email content
    const emailContent = `
      Subject: Your Prism Verification Code
      
      Hello,
      
      Your verification code is: ${code}
      
      This code will expire in 10 minutes.
      
      If you didn't request this code, please ignore this email.
      
      Best regards,
      The Prism Team
    `;
    
    console.log('📨 Email content:', emailContent);
    
    // For development, you could also save to a temporary file or database
    // that you can check to get the verification code
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        // For development only - remove in production
        debug: { email, code }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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
