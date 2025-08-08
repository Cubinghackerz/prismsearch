
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const PrismPagesHeader = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

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

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-prism-primary/10 to-prism-accent/10 border border-prism-primary/20">
          <FileText className="w-8 h-8 text-prism-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
            Prism Pages
          </h1>
          <p className="text-prism-text-muted mt-2 font-inter">
            Create and collaborate on rich-text documents
          </p>
        </div>
      </div>
      <Button onClick={createNewDocument} className="font-inter">
        <Plus className="w-4 h-4 mr-2" />
        New Document
      </Button>
    </div>
  );
};

export default PrismPagesHeader;
