
-- Create a table for stored passwords
CREATE TABLE public.stored_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  password_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own passwords
ALTER TABLE public.stored_passwords ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own passwords
CREATE POLICY "Users can view their own passwords" 
  ON public.stored_passwords 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own passwords (max 10)
CREATE POLICY "Users can create their own passwords" 
  ON public.stored_passwords 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND (
    SELECT COUNT(*) FROM public.stored_passwords WHERE user_id = auth.uid()
  ) < 10);

-- Create policy that allows users to UPDATE their own passwords
CREATE POLICY "Users can update their own passwords" 
  ON public.stored_passwords 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own passwords
CREATE POLICY "Users can delete their own passwords" 
  ON public.stored_passwords 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX idx_stored_passwords_user_id ON public.stored_passwords(user_id);
