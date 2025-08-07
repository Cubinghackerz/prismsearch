
-- Modify the documents table to use text instead of uuid for user_id
ALTER TABLE public.documents 
ALTER COLUMN user_id TYPE text;

-- Update the RLS policies to work with text user_id
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

-- Recreate policies for text-based user_id
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own documents" 
  ON public.documents 
  FOR UPDATE 
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING (user_id = auth.jwt() ->> 'sub');
