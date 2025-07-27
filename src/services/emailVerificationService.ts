
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

  // Send verification email using our edge function
  sendVerificationEmail: async (email: string, code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { email, code }
      });
      
      if (error) throw error;
      
      // For development, show the code in a toast
      console.log(`Verification code for ${email}: ${code}`);
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Fallback: log to console for development
      console.log(`📧 VERIFICATION CODE for ${email}: ${code}`);
      return { success: true, fallback: true };
    }
  }
};
