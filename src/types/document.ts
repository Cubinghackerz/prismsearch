
export interface Document {
  id: string;
  title: string;
  content: any; // TipTap JSON content
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_token: string;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  permission: 'view' | 'edit' | 'owner';
  created_at: string;
}

export interface CreateDocumentData {
  title: string;
  content?: any;
}

export interface UpdateDocumentData {
  title?: string;
  content?: any;
}
