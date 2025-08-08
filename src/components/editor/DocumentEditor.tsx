import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Table as TableIcon,
  Highlighter
} from 'lucide-react';

interface DocumentEditorProps {
  docId: string;
  content: any;
  onChange: (content: any) => void;
  className?: string;
  userName?: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  docId,
  content,
  onChange,
  className = '',
  userName,
}) => {
  const [wordCount, setWordCount] = useState(0);

  const ydoc = useMemo(() => new Y.Doc(), [docId]);
  const provider = useMemo(() => new WebrtcProvider(docId, ydoc), [docId, ydoc]);
  const yXmlFragment = useMemo(() => ydoc.getXmlFragment('document'), [ydoc]);

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Collaboration.configure({ document: yXmlFragment }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userName || 'Anonymous',
          color: '#ffa3d7',
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
      
      // Update word count
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8 text-prism-text font-inter',
      },
    },
  });

  // Set initial content when editor is first loaded
  useEffect(() => {
    if (editor && content) {
      const current = editor.getJSON();
      if (!current.content || current.content.length === 0) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  // Update word count on initial load
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  }, [editor]);

  const toggleHeading = useCallback((level: 1 | 2 | 3 | 4) => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-64">Loading editor...</div>;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-prism-border bg-prism-surface/30 backdrop-blur-md sticky top-0 z-40 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Headings */}
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleHeading(1)}
            className="p-2"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleHeading(2)}
            className="p-2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleHeading(3)}
            className="p-2"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 4 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleHeading(4)}
            className="p-2"
          >
            <Heading4 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Text Formatting */}
          <Button
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="p-2"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="p-2"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="p-2"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="p-2"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className="p-2"
          >
            <Highlighter className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Text Alignment */}
          <Button
            variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className="p-2"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className="p-2"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className="p-2"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists */}
          <Button
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="p-2"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Block Elements */}
          <Button
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="p-2"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className="p-2"
          >
            <Code className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Table */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            className="p-2"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-prism-surface/20 border border-prism-border rounded-lg shadow-lg min-h-[600px]">
        <EditorContent 
          editor={editor} 
          className="min-h-[600px] prose prose-lg max-w-none focus:outline-none p-8 text-prism-text"
        />
      </div>

      {/* Word Count */}
      <div className="flex justify-end mt-2 text-sm text-prism-text-muted">
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </div>
    </div>
  );
};

export default DocumentEditor;