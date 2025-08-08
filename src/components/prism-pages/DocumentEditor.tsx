
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Save,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface DocumentEditorProps {
  docId: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ docId }) => {
  const { userId } = useAuth();
  const [document, setDocument] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save after 2 seconds of inactivity
      debounceAutoSave();
    },
  });

  // Debounced auto-save function
  const debounceAutoSave = React.useCallback(
    debounce(() => {
      if (editor && document) {
        saveDocument();
      }
    }, 2000),
    [editor, document]
  );

  // Simple debounce implementation
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Load document data
  useEffect(() => {
    loadDocument();
  }, [docId]);

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (error) throw error;

      setDocument(data);
      setTitle(data.title);
      
      if (editor && data.content) {
        editor.commands.setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!editor || !document || isSaving) return;

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      
      const { error } = await supabase
        .from('documents')
        .update({ 
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (error) throw error;

      toast.success('Document saved');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debounceAutoSave();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prism-primary"></div>
      </div>
    );
  }

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between mb-6">
        <Input
          value={title}
          onChange={handleTitleChange}
          className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent"
          placeholder="Untitled Document"
        />
        <div className="flex items-center space-x-2">
          <Button
            onClick={saveDocument}
            disabled={isSaving}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border rounded-lg mb-4">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-prism-surface/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-prism-primary/10' : ''}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-prism-primary/10' : ''}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-prism-primary/10' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-prism-primary/10' : ''}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div className="min-h-[500px] bg-background">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center text-sm text-prism-text-muted">
        <div>
          Last saved: {document?.updated_at ? new Date(document.updated_at).toLocaleString() : 'Never'}
        </div>
        <div>
          {editor.storage.characterCount?.characters() || 0} characters
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
