
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    updated_at: string;
    content: any;
  };
  onRefetch: () => void;
}

const DocumentCard = ({ document, onRefetch }: DocumentCardProps) => {
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;

      toast.success("Document deleted successfully");
      onRefetch();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Failed to delete document");
    }
  };

  const openDocument = () => {
    navigate(`/docs/${document.id}`);
  };

  return (
    <Card className="cursor-pointer group hover:scale-[1.02] transition-all duration-200" onClick={openDocument}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-prism-primary/10">
              <FileText className="w-5 h-5 text-prism-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-prism-text truncate">
                {document.title}
              </CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDocument(); }}>
                <Edit3 className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-prism-text-muted mb-4">
          Updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
        </p>
        <div className="h-16 bg-prism-surface/30 rounded-lg flex items-center justify-center text-prism-text-muted text-sm">
          Preview content...
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
