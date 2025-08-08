
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@clerk/clerk-react";
import DocumentCard from "./DocumentCard";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DocumentsList = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createNewDocument = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          title: 'Untitled Document',
          content: {}
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("New document created!");
      navigate(`/docs/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error("Failed to create document");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-prism-primary/20 rounded mb-4"></div>
              <div className="h-3 bg-prism-primary/10 rounded mb-2"></div>
              <div className="h-3 bg-prism-primary/10 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-full bg-prism-primary/10 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <FileText className="w-10 h-10 text-prism-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-prism-text mb-3 font-inter">
          No documents yet
        </h3>
        <p className="text-prism-text-muted mb-6 font-inter">
          Create your first document to get started with Prism Pages
        </p>
        <Button onClick={createNewDocument} size="lg" className="font-inter">
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Document
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          onRefetch={refetch}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
