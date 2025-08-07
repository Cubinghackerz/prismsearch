
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import DocumentCard from '@/components/pages/DocumentCard';
import Navigation from '@/components/Navigation';
import { Plus, Search, FileText } from 'lucide-react';

const PrismPages = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/auth');
      return;
    }

    const loadDocuments = async () => {
      try {
        const docs = await DocumentService.getUserDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDocuments();
    }
  }, [user, isLoaded, navigate, toast]);

  const handleCreateDocument = async () => {
    navigate('/pages/new');
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await DocumentService.deleteDocument(id);
      setDocuments(docs => docs.filter(doc => doc.id !== id));
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleShareDocument = (document: Document) => {
    const shareUrl = `${window.location.origin}/pages/shared/${document.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Share Link Copied',
      description: 'Anyone with this link can view the document',
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Prism Pages
              </h1>
              <p className="text-muted-foreground text-lg">
                Create, edit, and collaborate on documents with rich text editing
              </p>
            </div>
            <Button onClick={handleCreateDocument} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDeleteDocument}
                  onShare={handleShareDocument}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first document to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateDocument} className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrismPages;
