
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DocumentEditor from '@/components/editor/DocumentEditor';
import { Document } from '@/types/document';

const DocumentEditorPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!documentId) {
    navigate('/pages');
    return null;
  }

  const handleSave = (document: Document) => {
    console.log('Document saved:', document);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <div className="border-b border-border bg-card p-2">
        <div className="max-w-4xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pages')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>

      <DocumentEditor documentId={documentId} onSave={handleSave} />
    </div>
  );
};

export default DocumentEditorPage;
