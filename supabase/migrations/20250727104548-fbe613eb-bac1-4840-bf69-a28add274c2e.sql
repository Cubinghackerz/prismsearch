
-- Create a table to store email verification codes
CREATE TABLE public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  is_used BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security (RLS) to the verification codes table
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting verification codes (public access needed for signup)
CREATE POLICY "Anyone can create verification codes" 
  ON public.email_verification_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for reading verification codes (public access needed for verification)
CREATE POLICY "Anyone can read verification codes for verification" 
  ON public.email_verification_codes 
  FOR SELECT 
  USING (true);

-- Create policy for updating verification codes (public access needed for marking as used)
CREATE POLICY "Anyone can update verification codes" 
  ON public.email_verification_codes 
  FOR UPDATE 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_email_verification_codes_email_code ON public.email_verification_codes(email, code);
CREATE INDEX idx_email_verification_codes_expires_at ON public.email_verification_codes(expires_at);

-- Create function to clean up expired verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.email_verification_codes 
  WHERE expires_at < now() OR is_used = true;
END;
$$;
