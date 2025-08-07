
import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import EditorToolbar from './EditorToolbar';
import { Share, Save, FileText } from 'lucide-react';

interface DocumentEditorProps {
  documentId: string;
  onSave?: (document: Document) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentId, onSave }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Update word count
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    },
  });

  // Load document on component mount
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await DocumentService.getDocument(documentId);
        setDocument(doc);
        setTitle(doc.title);
        if (editor && doc.content) {
          editor.commands.setContent(doc.content);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: 'Error',
          description: 'Failed to load document',
          variant: 'destructive',
        });
      }
    };

    if (documentId && documentId !== 'new') {
      loadDocument();
    } else if (documentId === 'new') {
      // Create new document
      const createNewDocument = async () => {
        try {
          const newDoc = await DocumentService.createDocument({
            title: 'Untitled Document',
            content: {},
          });
          setDocument(newDoc);
          setTitle(newDoc.title);
          // Update URL to reflect the new document ID
          window.history.replaceState(null, '', `/pages/${newDoc.id}`);
        } catch (error) {
          console.error('Error creating document:', error);
          toast({
            title: 'Error',
            description: 'Failed to create document',
            variant: 'destructive',
          });
        }
      };
      createNewDocument();
    }
  }, [documentId, editor, toast]);

  // Auto-save functionality
  const saveDocument = useCallback(async () => {
    if (!document || !editor || isSaving) return;

    setIsSaving(true);
    try {
      const updatedDoc = await DocumentService.updateDocument(document.id, {
        title,
        content: editor.getJSON(),
      });
      setDocument(updatedDoc);
      setLastSaved(new Date());
      onSave?.(updatedDoc);
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [document, editor, title, isSaving, onSave, toast]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!document || !editor) return;

    const interval = setInterval(() => {
      saveDocument();
    }, 5000);

    return () => clearInterval(interval);
  }, [saveDocument, document, editor]);

  // Manual save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);

  const handleShare = () => {
    if (document) {
      const shareUrl = `${window.location.origin}/pages/shared/${document.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Share Link Copied',
        description: 'Anyone with this link can view the document',
      });
    }
  };

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <FileText className="h-6 w-6 animate-spin" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus-visible:ring-0 px-0 max-w-md"
              placeholder="Document title..."
            />
            <div className="text-sm text-muted-foreground">
              {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={saveDocument}
              disabled={isSaving}
              size="sm"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto">
        <EditorToolbar editor={editor} />
        <div className="min-h-[600px] bg-card border border-border rounded-b-lg">
          <EditorContent
            editor={editor}
            className="prose prose-slate dark:prose-invert max-w-none p-8 focus:outline-none"
          />
        </div>
        
        {/* Status bar */}
        <div className="flex justify-between items-center p-2 text-sm text-muted-foreground border-x border-b border-border bg-card rounded-b-lg">
          <div>
            {wordCount} words
          </div>
          <div>
            Document ID: {document.id.slice(0, 8)}...
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
