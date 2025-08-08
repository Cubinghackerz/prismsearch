
-- Enable RLS on existing tables if not already enabled
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

-- Update the documents table to ensure it has all needed columns
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Document',
ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid();

-- Update RLS policies for documents to be more specific
DROP POLICY IF EXISTS "Enable all access for documents" ON public.documents;

CREATE POLICY "Users can view their own documents and public documents" 
ON public.documents FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure document_collaborators table has proper structure
ALTER TABLE public.document_collaborators 
ADD COLUMN IF NOT EXISTS permission text DEFAULT 'view';

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE PROCEDURE update_document_updated_at();
