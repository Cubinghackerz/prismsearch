
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Create new policies that work with Clerk authentication
-- Since we're using anon key, we'll allow all operations and rely on application-level security
CREATE POLICY "Enable all access for documents" 
  ON public.documents 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
