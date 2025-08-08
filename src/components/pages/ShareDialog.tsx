
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Link, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  title: string;
  is_public: boolean;
  share_token: string;
  user_id: string;
}

interface ShareDialogProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ 
  document, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [isPublic, setIsPublic] = useState(document.is_public);
  const [isUpdating, setIsUpdating] = useState(false);

  const shareUrl = `${window.location.origin}/pages/shared/${document.share_token}`;

  const togglePublicAccess = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_public: !isPublic })
        .eq('id', document.id);

      if (error) {
        console.error('Error updating document visibility:', error);
        toast.error('Failed to update sharing settings');
        return;
      }

      setIsPublic(!isPublic);
      onUpdate();
      toast.success(
        !isPublic 
          ? 'Document is now publicly accessible' 
          : 'Document is now private'
      );
    } catch (error) {
      console.error('Error updating document visibility:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 font-fira-code">
            <Link className="h-5 w-5" />
            <span>Share "{document.title}"</span>
          </DialogTitle>
          <DialogDescription className="font-fira-code">
            Control who can access this document and how they can interact with it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                {isPublic ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <Label className="text-base font-fira-code">
                  Public Access
                </Label>
              </div>
              <p className="text-sm text-muted-foreground font-fira-code">
                {isPublic 
                  ? 'Anyone with the link can view this document' 
                  : 'Only you can access this document'
                }
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={togglePublicAccess}
              disabled={isUpdating}
            />
          </div>

          {/* Share Link */}
          {isPublic && (
            <div className="space-y-2">
              <Label className="font-fira-code">Share Link</Label>
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-fira-code text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareLink}
                  className="shrink-0 font-fira-code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-fira-code">
                Anyone with this link can view the document
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose} className="font-fira-code">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
