
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save,
  Users,
  Undo,
  Redo
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
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  // Debounced auto-save function
  const debounceAutoSave = useCallback(
    debounce(() => {
      if (document) {
        saveDocument();
      }
    }, 2000),
    [document, title, content]
  );

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
      
      // Handle content - convert from TipTap format if needed
      let textContent = '';
      if (data.content) {
        if (typeof data.content === 'object' && data.content !== null) {
          // Convert TipTap JSON to plain text
          textContent = extractTextFromTipTapJSON(data.content);
        } else if (typeof data.content === 'string') {
          textContent = data.content;
        }
      }
      
      setContent(textContent);
      setHistory([textContent]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract text from TipTap JSON format
  const extractTextFromTipTapJSON = (json: any): string => {
    if (!json || !json.content) return '';
    
    let text = '';
    
    const extractFromNode = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractFromNode).join('');
      }
      
      return '';
    };
    
    if (Array.isArray(json.content)) {
      text = json.content.map(extractFromNode).join('\n');
    }
    
    return text;
  };

  const saveDocument = async () => {
    if (!document || isSaving) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          title,
          content: content, // Store as plain text
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    debounceAutoSave();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prism-primary"></div>
      </div>
    );
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
            onClick={handleUndo}
            disabled={historyIndex === 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div className="bg-background">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your document..."
            className="min-h-[500px] border-none resize-none focus:ring-0 text-lg leading-relaxed p-6"
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center text-sm text-prism-text-muted">
        <div>
          Last saved: {document?.updated_at ? new Date(document.updated_at).toLocaleString() : 'Never'}
        </div>
        <div>
          {content.length} characters
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
