
import { supabase } from "@/integrations/supabase/client";
import { Document, CreateDocumentData, UpdateDocumentData } from "@/types/document";

export class DocumentService {
  static async createDocument(data: CreateDocumentData): Promise<Document> {
    // Get the current user first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        title: data.title,
        content: data.content || {},
        user_id: user.id // Use the user ID directly
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }
    
    return document;
  }

  static async getDocument(id: string): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
    
    return document;
  }

  static async getUserDocuments(): Promise<Document[]> {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id) // Filter by user_id explicitly
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
    
    return documents || [];
  }

  static async updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        ...data,
        updated_at: new Date().toISOString() // Explicitly set updated_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw error;
    }
    
    return document;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
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

    if (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}
