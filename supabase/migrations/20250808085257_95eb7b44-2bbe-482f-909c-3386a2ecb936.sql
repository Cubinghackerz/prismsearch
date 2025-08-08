
-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB NOT NULL DEFAULT '{}',
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT false,
  share_token UUID DEFAULT gen_random_uuid()
);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view their own documents and public documents" 
  ON public.documents 
  FOR SELECT 
  USING (user_id = auth.jwt() ->> 'sub' OR is_public = true);

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

-- Create document collaborators table for sharing
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on collaborators table
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for collaborators
CREATE POLICY "Document owners can manage collaborators" 
  ON public.document_collaborators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = document_collaborators.document_id 
      AND documents.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view collaborators of their own documents" 
  ON public.document_collaborators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = document_collaborators.document_id 
      AND documents.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_updated_at();

-- Enable realtime for documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_collaborators;
