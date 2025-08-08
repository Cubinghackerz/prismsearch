
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Share, Users, Download, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DocumentEditor from '@/components/editor/DocumentEditor';
import ShareDialog from '@/components/pages/ShareDialog';
import Navigation from '@/components/Navigation';
import { formatDistanceToNow } from 'date-fns';

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
  const { toast } = useToast();

  useEffect(() => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access documents",
        variant: "destructive"
      });
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
        toast({
          title: "Failed to load document",
          description: "An error occurred while loading the document",
          variant: "destructive"
        });
        navigate('/pages');
        return;
      }

      setDocument(data);
      setTitle(data.title);
      setContent(data.content);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Failed to load document", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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
        toast({
          title: "Failed to save document",
          description: "An error occurred while saving",
          variant: "destructive"
        });
        return;
      }

      setLastSaved(new Date());
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Failed to save document",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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
      <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-prism-text-muted mx-auto mb-4 animate-pulse" />
          <p className="text-prism-text-muted font-fira-code">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-prism-text-muted mx-auto mb-4" />
          <p className="text-prism-text-muted mb-4 font-fira-code">Document not found</p>
          <Button onClick={() => navigate('/pages')} className="font-fira-code">
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-prism-border bg-prism-surface/80 backdrop-blur-md sticky top-0 z-40">
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
                  className="border-none bg-transparent text-lg font-medium focus-visible:ring-0 font-fira-code text-prism-text"
                  placeholder="Untitled Document"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-sm text-prism-text-muted font-fira-code flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
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

      {/* Editor */}
      <main className="container mx-auto px-6 py-8">
        <Card className="max-w-5xl mx-auto bg-prism-surface/50 border-prism-border shadow-xl">
          <DocumentEditor
            content={content}
            onChange={setContent}
            className="min-h-[70vh]"
          />
        </Card>
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
