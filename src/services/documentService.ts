
import { supabase } from "@/integrations/supabase/client";
import { Document, CreateDocumentData, UpdateDocumentData } from "@/types/document";

export class DocumentService {
  static async createDocument(data: CreateDocumentData): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        title: data.title,
        content: data.content || {},
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return document;
  }

  static async getDocument(id: string): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return document;
  }

  static async getUserDocuments(): Promise<Document[]> {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return documents || [];
  }

  static async updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return document;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async shareDocument(id: string, userEmail: string, permission: 'view' | 'edit'): Promise<void> {
    // First, get the user by email (this would require a function or different approach in real implementation)
    // For now, we'll use a placeholder approach
    const { error } = await supabase
      .from('document_collaborators')
      .insert({
        document_id: id,
        user_id: userEmail, // In real implementation, this would be resolved to user ID
        permission
      });

    if (error) throw error;
  }
}
