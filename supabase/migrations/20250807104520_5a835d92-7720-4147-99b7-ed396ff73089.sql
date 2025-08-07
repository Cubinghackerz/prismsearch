
-- Drop existing policies that cause circular reference
DROP POLICY IF EXISTS "Users can view collaborators of documents they have access to" ON document_collaborators;
DROP POLICY IF EXISTS "Document owners can manage collaborators" ON document_collaborators;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents or documents they have edi" ON documents;

-- Create new policies for documents table without circular reference
CREATE POLICY "Users can view their own documents and public documents" 
  ON documents 
  FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can update their own documents" 
  ON documents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create simpler policies for document_collaborators table
CREATE POLICY "Users can view collaborators of their own documents" 
  ON document_collaborators 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_collaborators.document_id 
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Document owners can manage collaborators" 
  ON document_collaborators 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_collaborators.document_id 
    AND documents.user_id = auth.uid()
  ));
