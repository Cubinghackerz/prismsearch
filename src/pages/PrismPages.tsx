import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user_id: string;
}

const PrismPages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      if (!isSignedIn) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      return data as Document[];
    },
    enabled: isSignedIn,
  });

  const createNewDocument = async () => {
    if (!isSignedIn || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create documents",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: 'Untitled Document',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast({
          title: "Failed to create document",
          description: "An error occurred while creating the document",
          variant: "destructive"
        });
        return;
      }

      navigate(`/docs/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Failed to create document",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (docId: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Failed to delete document",
          description: "An error occurred while deleting the document",
          variant: "destructive"
        });
        return;
      }

      refetch();
      toast({
        title: "Document deleted",
        description: `"${docTitle}" has been deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Failed to delete document",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface font-fira-code">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-prism-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
                Prism Pages
              </h1>
            </div>
            <p className="text-prism-text-muted mt-2 font-fira-code">
              Create, edit, and collaborate on documents with powerful rich text features
            </p>
          </div>
          
          <Button 
            onClick={createNewDocument} 
            size="lg"
            className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90 font-fira-code"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Authentication Check */}
        {!isSignedIn && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-prism-text-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-prism-text font-fira-code">
              Sign in to access Prism Pages
            </h3>
            <p className="text-prism-text-muted mb-4 font-fira-code">
              Create an account to start building your document library
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90 font-fira-code"
            >
              Sign In / Sign Up
            </Button>
          </div>
        )}

        {/* Search */}
        {isSignedIn && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-prism-text-muted" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-prism-surface/50 border-prism-border text-prism-text font-fira-code"
              />
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {isSignedIn && (
          <>
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-prism-surface/30 border-prism-border">
                    <CardHeader>
                      <div className="h-4 bg-prism-surface rounded w-3/4"></div>
                      <div className="h-3 bg-prism-surface rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-prism-surface rounded mb-2"></div>
                      <div className="h-3 bg-prism-surface rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-prism-text-muted mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-prism-text font-fira-code">
                  {searchQuery ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-prism-text-muted mb-4 font-fira-code">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first document to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={createNewDocument} 
                    className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90 font-fira-code"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <Card 
                    key={doc.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 group bg-prism-surface/30 border-prism-border hover:bg-prism-surface/50"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          <FileText className="h-5 w-5 text-prism-primary" />
                          <CardTitle className="text-base font-fira-code group-hover:text-prism-primary transition-colors text-prism-text line-clamp-1">
                            {doc.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/docs/${doc.id}`);
                            }}
                            className="p-1 h-8 w-8 text-prism-primary hover:bg-prism-primary/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id, doc.title);
                            }}
                            className="p-1 h-8 w-8 text-red-400 hover:bg-red-400/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {doc.is_public && <Users className="h-4 w-4 text-prism-text-muted" />}
                      </div>
                      <CardDescription className="flex items-center space-x-1 font-fira-code text-prism-text-muted">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent 
                      onClick={() => navigate(`/docs/${doc.id}`)}
                    >
                      <p className="text-sm text-prism-text-muted line-clamp-3 font-fira-code">
                        {doc.content?.content?.[0]?.content?.[0]?.text || 'Empty document'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PrismPages;