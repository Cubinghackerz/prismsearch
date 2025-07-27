
import { supabase } from '@/integrations/supabase/client';

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
}

export const emailVerificationService = {
  // Generate a 6-digit code
  generateCode: (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Store verification code in database
  storeVerificationCode: async (email: string, code: string) => {
    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_verification_codes');
    
    const { data, error } = await supabase
      .from('email_verification_codes')
      .insert([{ email, code }])
      .select()
      .single();
    
    if (error) {
      console.error('Error storing verification code:', error);
      throw error;
    }
    
    return data;
  },

  // Verify the code
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Mark code as used
    await supabase
      .from('email_verification_codes')
      .update({ is_used: true })
      .eq('id', data.id);
    
    return true;
  },

  // Send verification email (mock implementation - in production you'd use an email service)
  sendVerificationEmail: async (email: string, code: string) => {
    // In a real implementation, you would send an email using a service like Resend
    // For now, we'll just log it to console and show a toast
    console.log(`Verification code for ${email}: ${code}`);
    
    // You could also create a Supabase edge function to send emails
    // return await supabase.functions.invoke('send-verification-email', {
    //   body: { email, code }
    // });
    
    return { success: true };
  }
};
