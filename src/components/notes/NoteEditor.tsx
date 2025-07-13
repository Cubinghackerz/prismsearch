
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Tag, X } from 'lucide-react';
import { decryptText } from '@/utils/encryption';

interface Note {
  id: string;
  title: string;
  content_encrypted: string;
  topic_tags: string[];
  linked_notes: string[];
  whiteboard_data: any;
  created_at: string;
  updated_at: string;
}

interface NoteEditorProps {
  note: Note | null;
  isCreating: boolean;
  onSave: (noteData: { title: string; content: string; tags: string[] }) => void;
  onDelete: () => void;
  theme: any;
}

const NoteEditor = ({ note, isCreating, onSave, onDelete, theme }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-correct dictionary - basic implementation
  const autoCorrectDict: { [key: string]: string } = {
    'teh': 'the',
    'recieve': 'receive',
    'seperate': 'separate',
    'definately': 'definitely',
    'occured': 'occurred',
    'neccessary': 'necessary',
    'accomodate': 'accommodate',
    'acheive': 'achieve',
    'beleive': 'believe',
    'begining': 'beginning'
  };

  const applyAutoCorrect = useCallback((text: string): string => {
    let correctedText = text;
    Object.entries(autoCorrectDict).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correct);
    });
    return correctedText;
  }, []);

  useEffect(() => {
    if (note && !isCreating) {
      setTitle(note.title);
      setTags(note.topic_tags || []);
      
      // Decrypt content
      const loadContent = async () => {
        setIsLoading(true);
        try {
          const decryptedContent = await decryptText(note.content_encrypted);
          setContent(decryptedContent);
        } catch (error) {
          console.error('Failed to decrypt content:', error);
          setContent('Failed to decrypt content');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    } else if (isCreating) {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [note, isCreating]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const lastChar = newContent.slice(-1);
    
    if (lastChar === ' ' || lastChar === '\n') {
      const correctedContent = applyAutoCorrect(newContent);
      setContent(correctedContent);
    } else {
      setContent(newContent);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        tags
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className={`p-6 h-full ${theme.bg}`}>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`text-xl font-semibold ${theme.cardBg} ${theme.border} ${theme.text}`}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className={`${theme.accent} text-white`}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            {!isCreating && (
              <Button
                onClick={onDelete}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className={`w-4 h-4 ${theme.textMuted}`} />
            <Input
              placeholder="Add tags..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className={`w-48 ${theme.cardBg} ${theme.border} ${theme.text}`}
            />
            <Button onClick={handleAddTag} size="sm" variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`${theme.highlight} ${theme.text} cursor-pointer hover:opacity-80`}
              >
                {tag}
                <X
                  className="w-3 h-3 ml-1"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className={`${theme.cardBg} ${theme.border} border rounded-lg p-4 h-full flex items-center justify-center`}>
              <div className="animate-pulse">Loading content...</div>
            </div>
          ) : (
            <Textarea
              placeholder="Start writing your note... (Auto-correct is enabled)"
              value={content}
              onChange={handleContentChange}
              className={`h-full resize-none ${theme.cardBg} ${theme.border} ${theme.text} focus:ring-2 focus:ring-blue-500`}
              onKeyPress={handleKeyPress}
            />
          )}
        </div>

        {/* Auto-correct hint */}
        <div className={`mt-2 text-xs ${theme.textMuted}`}>
          💡 Auto-correct is active. Common typos will be fixed automatically when you press space.
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
