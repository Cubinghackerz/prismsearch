
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
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
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isSignedIn } = useUser();

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
      toast.error('Please sign in to create documents');
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
        toast.error('Failed to create document');
        return;
      }

      navigate(`/docs/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
  };

  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
                Prism Pages
              </h1>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30 font-fira-code">
                Beta
              </span>
            </div>
            <p className="text-muted-foreground mt-2 font-fira-code">
              Create, edit, and collaborate on documents with powerful features
            </p>
          </div>
          
          <Button 
            onClick={createNewDocument} 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-fira-code"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-fira-code"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 font-fira-code">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-muted-foreground mb-4 font-fira-code">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : isSignedIn 
                  ? 'Create your first document to get started'
                  : 'Sign in to create and manage your documents'
              }
            </p>
            {!searchQuery && (
              <Button onClick={createNewDocument} className="font-fira-code">
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card 
                key={doc.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => navigate(`/docs/${doc.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base font-fira-code group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>
                    </div>
                    {doc.is_public && <Users className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <CardDescription className="flex items-center space-x-1 font-fira-code">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 font-fira-code">
                    {doc.content?.content?.[0]?.content?.[0]?.text || 'Empty document'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PrismPages;
