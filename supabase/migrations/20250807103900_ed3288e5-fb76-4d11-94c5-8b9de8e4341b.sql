
-- Create documents table for storing user documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT FALSE,
  share_token UUID DEFAULT gen_random_uuid()
);

-- Create document_collaborators table for managing shared access
CREATE TABLE public.document_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  permission TEXT CHECK (permission IN ('view', 'edit', 'owner')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view their own documents" 
  ON public.documents 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    is_public = true OR
    EXISTS (
      SELECT 1 FROM document_collaborators 
      WHERE document_id = documents.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents or documents they have edit access to" 
  ON public.documents 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM document_collaborators 
      WHERE document_id = documents.id 
      AND user_id = auth.uid() 
      AND permission IN ('edit', 'owner')
    )
  );

CREATE POLICY "Users can delete their own documents" 
  ON public.documents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS to document_collaborators table
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for document_collaborators
CREATE POLICY "Users can view collaborators of documents they have access to" 
  ON public.document_collaborators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_id 
      AND (
        documents.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM document_collaborators dc2 
          WHERE dc2.document_id = documents.id 
          AND dc2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Document owners can manage collaborators" 
  ON public.document_collaborators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Create function to update document updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_document_updated_at();

-- Enable realtime for collaborative editing
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_collaborators;
