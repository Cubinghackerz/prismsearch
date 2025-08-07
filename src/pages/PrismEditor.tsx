
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Share, Users, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RichTextEditor from '@/components/pages/RichTextEditor';
import DocumentToolbar from '@/components/pages/DocumentToolbar';
import ShareDialog from '@/components/pages/ShareDialog';

interface Document {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user_id: string;
  share_token: string;
}

const PrismEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('id');
  const { user, isSignedIn } = useUser();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      toast.error('Please sign in using the button in the navigation to access documents');
      navigate('/pages');
      return;
    }

    if (documentId) {
      loadDocument();
    } else {
      setIsLoading(false);
      navigate('/pages');
    }
  }, [documentId, isSignedIn]);

  const loadDocument = async () => {
    if (!documentId || !isSignedIn) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error loading document:', error);
        toast.error('Failed to load document');
        navigate('/pages');
        return;
      }

      setDocument(data);
      setTitle(data.title);
      setContent(data.content);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
      navigate('/pages');
    }
  };

  const saveDocument = async () => {
    if (!document || !documentId || !isSignedIn) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: title || 'Untitled Document',
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        console.error('Error saving document:', error);
        toast.error('Failed to save document');
        return;
      }

      setLastSaved(new Date());
      toast.success('Document saved');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!document || !isSignedIn) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveDocument();
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [title, content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground font-fira-code">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4 font-fira-code">Document not found</p>
          <Button onClick={() => navigate('/pages')} className="font-fira-code">
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pages')}
                className="font-fira-code"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-none bg-transparent text-lg font-medium focus-visible:ring-0 font-fira-code"
                  placeholder="Untitled Document"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-sm text-muted-foreground font-fira-code">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="font-fira-code"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={saveDocument}
                disabled={isSaving}
                size="sm"
                className="font-fira-code"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <DocumentToolbar />

      {/* Editor */}
      <main className="container mx-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <RichTextEditor
            content={content}
            onChange={setContent}
          />
        </div>
      </main>

      {/* Share Dialog */}
      <ShareDialog
        document={document}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onUpdate={loadDocument}
      />
    </div>
  );
};

export default PrismEditor;
